import { concatMap, of, takeWhile, timer } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as url from 'url';
import * as fileSystem from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import { mockUserDatasets } from '../src/app/_mocked/mocked-progress-info';
import {
  DatasetInfo,
  DatasetStatus,
  HarvestProtocol,
  ProblemPatternAnalysisStatus,
  ProgressByStep,
  StepStatus,
  SubmissionResponseData,
  TierInfo,
  UserDatasetInfo
} from '../src/app/_models';

import { handleDebiasUrls, runDebias } from './data/debias';
import { stepErrorDetails } from './data/step-error-detail';
import { RecordGenerator } from './data/record-generator';
import { ReportGenerator } from './data/report-generator';
import { generateProblem } from './data/problem-pattern-generator';
import {
  GroupedDatasetData,
  ProblemPatternsDatasetWithSubscriptionRef,
  ProgressBurndown,
  ProgressByStepStatus,
  UrlManipulation
} from './models/models';

new (class extends TestDataServer {
  serverName = 'sandbox';
  errorCodes: Array<string>;
  newId = 0;
  dataRegistry: Map<string, GroupedDatasetData> = new Map<string, GroupedDatasetData>();
  recordGenerator: RecordGenerator;
  reportGenerator: ReportGenerator;

  /**
   * constructor
   *
   * initialise generators and errorCodes
   **/
  constructor() {
    super();

    this.recordGenerator = new RecordGenerator();
    this.reportGenerator = new ReportGenerator();

    const generateRange = (start: number, end: number): Array<string> => {
      return [...Array(1 + end - start).keys()].map((v: number) => {
        return `${start + v}`;
      });
    };
    this.errorCodes = generateRange(400, 418).concat(generateRange(500, 508));
  }

  /**
   * newDateString
   *
   * Sinulate a GMT offset
   **/
  newDateString(): string {
    const serverHoursInFuture = 3;
    const date = new Date(Date.now() + serverHoursInFuture * (60 * 60 * 1000));
    return date.toISOString().replace('Z', `+0${serverHoursInFuture}:00`);
  }

  /**
   * handle404
   *
   * Handles 404 errors by setting the response status code and ending it with a message
   *
   * @param {string} route - the invalid route
   * @param {ServerResponse} response - the response object
   **/
  handle404(route: string, response: ServerResponse): void {
    const urlParams =
      '?country=Hungary&language=hu&clientFilename=Test_Sandbox.zip&mimeType=application/zip';
    const urlPOST = '/dataset/my-dataset-name/process' + urlParams;
    const urlGET = '/dataset/1';
    this.headerText(response);
    response.statusCode = 404;
    response.end(
      super.get404() +
        `<br/><br/>You came <b><a href="${route}">here</a></b> but you need a correct url
      <ul>
      <li><span>POST: <a href="${urlPOST}">${urlPOST}</a></span></li>
      <li><span>GET: <a href="${urlGET}">${urlGET}</a></span></li>
      </ul>`
    );
  }

  /** handleUpload
   **/
  handleUpload(request: IncomingMessage, response: ServerResponse, datasetName: string): void {
    const route = request.url as string;

    if (datasetName === '404') {
      this.handle404(route, response);
      return;
    }

    const params = url.parse(route, true).query;
    const getParam = (name: string): string => {
      return params[name] as string;
    };

    const harvestType =
      route.indexOf('harvestOaiPmh') > -1
        ? HarvestProtocol.HARVEST_OAI_PMH
        : route.indexOf('harvestByUrl') > -1
        ? HarvestProtocol.HARVEST_HTTP
        : HarvestProtocol.HARVEST_FILE;

    const data = this.initialiseGroupedDatasetData(
      `${this.newId}`,
      `${this.userId}`,
      harvestType,
      datasetName,
      getParam('country'),
      getParam('language')
    );

    // Register data and send response

    this.addToRegistry(`${this.newId}`, data);
    this.headerJSON(response);
    response.end(
      JSON.stringify({
        'dataset-id': `${this.newId}`,
        'duplicate-records': 0,
        'records-to-process': 0
      } as SubmissionResponseData)
    );

    const datasetInfo = data['dataset-info'];

    // Temporary function to add non-model (parameter) fields
    const addNewDatasetInfoField = (name: string, value: string | boolean): void => {
      const res = datasetInfo['harvesting-parameters'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res as any)[name] = value;
      datasetInfo['harvesting-parameters'] = res;
    };

    request.on('data', (requestData) => {
      requestData = `${requestData}`;
      if (requestData.indexOf('filename=') > -1) {
        const fName = /"[A-Za-z_-\d]*.[\d]*"/.exec(requestData);
        if (fName) {
          if (requestData.indexOf('name="dataset"') > -1) {
            const fileName = fName[0].replace(/["]/g, '');
            addNewDatasetInfoField('file-type', fileName.split('.')[1]);
            addNewDatasetInfoField('file-name', fileName);
          }
          if (requestData.indexOf('name="xsltFile"') > -1) {
            datasetInfo['transformed-to-edm-external'] = true;
          }
        }
      }
    });
  }

  /**
   * initialiseProgressByStep
   *
   * Initialises and returns a new ProgressByStep object
   *
   * @param {StepStatus} step - the value for the result's 'step'
   * @param {number} totalRecords - the value for the result's 'total'
   * @returns {ProgressByStep}
   **/
  initialiseProgressByStep(step: StepStatus, totalRecords: number): ProgressByStep {
    return {
      fail: 0,
      warn: 0,
      success: 0,
      step: step,
      total: totalRecords
    };
  }

  /**
   * initialiseGroupedDatasetData
   *
   * Initialises and returns a new GroupedDatasetData object
   *
   * @param {number} totalRecords - the value for the result's 'total-records'
   * @returns {GroupedDatasetData}
   **/
  initialiseGroupedDatasetData(
    datasetId: string,
    creatorId: string,
    harvestType:
      | HarvestProtocol.HARVEST_OAI_PMH
      | HarvestProtocol.HARVEST_HTTP
      | HarvestProtocol.HARVEST_FILE,
    datasetName?: string,
    country?: string,
    language?: string
  ): GroupedDatasetData {
    const idAsNumber = parseInt(datasetId[0]);
    const totalRecords = idAsNumber;
    const steps = Object.values(StepStatus).filter((step: StepStatus) => {
      return ![
        HarvestProtocol.HARVEST_OAI_PMH,
        HarvestProtocol.HARVEST_HTTP,
        HarvestProtocol.HARVEST_FILE
      ].includes((step as unknown) as HarvestProtocol);
    });
    steps.unshift((harvestType as unknown) as StepStatus);

    const createEmptyTier = (): TierInfo => {
      return { samples: [], total: 0 } as TierInfo;
    };

    const tierZeroInfo =
      idAsNumber % 5 === 0
        ? {
            'metadata-tier': createEmptyTier()
          }
        : idAsNumber % 2 === 0
        ? undefined
        : idAsNumber % 3 === 0
        ? {
            'content-tier': createEmptyTier(),
            'metadata-tier': createEmptyTier()
          }
        : {
            'content-tier': createEmptyTier()
          };

    const datasetInfo: DatasetInfo = {
      'creation-date': this.newDateString(),
      'created-by-id': creatorId,
      'dataset-id': datasetId,
      'dataset-name': datasetName ? datasetName : 'GeneratedName',
      country: country ? country : 'GeneratedCountry',
      language: language ? language : 'GeneratedLanguage',
      'harvesting-parameters': {
        'harvest-protocol': harvestType
      }
    };

    const harvestingParams = datasetInfo['harvesting-parameters'];

    if (harvestType === HarvestProtocol.HARVEST_OAI_PMH) {
      harvestingParams.url = 'http://default-oai-url';
      harvestingParams['set-spec'] = 'default-set-spec';
      harvestingParams['metadata-format'] = 'default-metadata-format';
    } else if (harvestType === HarvestProtocol.HARVEST_HTTP) {
      harvestingParams.url = 'http://default-http-url';
    } else if (harvestType === HarvestProtocol.HARVEST_FILE) {
      harvestingParams['file-name'] = 'file.zip';
      harvestingParams['file-type'] = 'zip';
    }

    return {
      'dataset-info': datasetInfo,
      'dataset-progress': {
        status: DatasetStatus.IN_PROGRESS,
        'record-limit-exceeded': !!(datasetName && datasetName.length > 10),
        'records-published-successfully': true,
        'total-records': totalRecords,
        'error-type': datasetId === '13' ? 'The process failed bigly' : '',
        'processed-records': 0,
        'progress-by-step': steps.map((key: StepStatus) => {
          return this.initialiseProgressByStep(key, totalRecords);
        }),
        'dataset-logs': [],
        'tier-zero-info': tierZeroInfo
      }
    };
  }

  /**
   * makeProgressTierZero
   *
   * Adds content to the data.dataset['tier-zero-info'] object
   *
   * @param { GroupedDatasetData } data - the GroupedDatasetData object to operate on
   **/
  makeProgressTierZero(data: GroupedDatasetData, timesCalled: number, add?: number): void {
    const dataset = data['dataset-progress'];
    const maxRecordListLength = 10;
    const datasetInfo = data['dataset-info'];
    const tierZeroInfo = dataset['tier-zero-info'];

    if (datasetInfo && tierZeroInfo) {
      [
        { tier: 'content-tier', mod: 2 },
        { tier: 'metadata-tier', mod: 3 }
      ].forEach((item) => {
        if (timesCalled % item.mod === 0) {
          const info = tierZeroInfo[item.tier as 'content-tier' | 'metadata-tier'];
          if (info) {
            const itemsToAdd = add ? add : Math.pow(item.mod, 3);
            for (let i = 0; i < itemsToAdd; i++) {
              if (info.samples.length < maxRecordListLength) {
                info.samples.push(
                  `/${datasetInfo['dataset-id']}/Record_id_XYZABC__C3PO_GTXXX_SDF_76_14_${item.tier}`
                );
                info.total += 1;
              }
            }
          }
        }
      });
    }
  }

  /**
   * makeProgress
   *
   * Bumps fields in the data object making corresponding depletions to fields in the burndown object
   *
   * @param { GroupedDatasetData } data - the GroupedDatasetData object to operate on
   * @param { ProgressBurndown } burndown - the burndown object
   **/
  makeProgress(data: GroupedDatasetData, burndown: ProgressBurndown): boolean {
    const dataset = data['dataset-progress'];
    const pbsArray = dataset['progress-by-step'];

    if (dataset['processed-records'] === dataset['total-records']) {
      // early exit...
      if (dataset.status !== DatasetStatus.FAILED) {
        dataset.status = DatasetStatus.COMPLETED;
        if (!!dataset['processed-records'] && !!burndown.fail) {
          dataset['portal-publish'] = 'http://localhost:3000/this-collection/that-dataset/publish';
        }
      }

      const tierZeroInfo = dataset['tier-zero-info'];
      if (tierZeroInfo) {
        const ct = tierZeroInfo['content-tier'];
        const mt = tierZeroInfo['metadata-tier'];
        if ((ct && ct.samples.length === 0) || (mt && mt.samples.length === 0)) {
          this.makeProgressTierZero(data, burndown.timesCalled, 1);
        }
      }
      dataset['records-published-successfully'] =
        pbsArray[pbsArray.length - 1][ProgressByStepStatus.SUCCESS] > 0;
      return true;
    }

    dataset['processed-records'] += 1;

    // Add tierzero warnings
    this.makeProgressTierZero(data, burndown.timesCalled);

    // burn down the progress
    const shiftField =
      burndown.warn > 0
        ? ProgressByStepStatus.WARN
        : burndown.fail > 0
        ? ProgressByStepStatus.FAIL
        : ProgressByStepStatus.SUCCESS;
    const statusTargets = burndown.statusTargets
      ? burndown.statusTargets
      : Array.from(pbsArray.keys());

    pbsArray.forEach((pbs: ProgressByStep, key: number) => {
      if (shiftField !== ProgressByStepStatus.SUCCESS && statusTargets.indexOf(key) > -1) {
        pbs[shiftField] += 1;
        if (shiftField === ProgressByStepStatus.FAIL && burndown.error > 0) {
          const errorNum = dataset['processed-records'];
          const error = {
            type:
              (errorNum % 2 === 0 ? ProgressByStepStatus.WARN : ProgressByStepStatus.FAIL) +
              ` (${errorNum})`,
            message: stepErrorDetails[errorNum % stepErrorDetails.length],
            records: [`${errorNum}`, `${key}`, `${errorNum * key}`]
          };
          if (pbs.errors) {
            pbs.errors.push(error);
          } else {
            pbs.errors = [error];
          }
          burndown.error--;
        }
      } else {
        pbs[ProgressByStepStatus.SUCCESS] += 1;
      }
    });
    if (shiftField !== ProgressByStepStatus.SUCCESS) {
      burndown[shiftField]--;
    }
    burndown.timesCalled += 1;
    return false;
  }

  /**
   * handleId
   *
   * Retrieves or creates a GroupedDatasetData object with the supplied id
   *
   * The id "42001357" will be interpreted as having:
   *  - 4 records in total
   *  - 2 warn
   *  - 0 fail
   *  - 0 errors
   *  - 1,3,5,7 will be the 'progress-by-step' items to apply the (non success) statuses to
   *
   *  @param {string} id - the id to track
   **/
  handleId(id: string, appendErrors = 0): GroupedDatasetData {
    const existingData = this.dataRegistry.get(id);
    if (existingData) {
      return existingData;
    } else {
      const numericId = parseInt(this.ensureNumeric(id[0]));
      let harvestType = HarvestProtocol.HARVEST_FILE;

      switch (numericId % 3) {
        case 0: {
          harvestType = HarvestProtocol.HARVEST_FILE;
          break;
        }
        case 1: {
          harvestType = HarvestProtocol.HARVEST_HTTP;
          break;
        }
        case 2: {
          harvestType = HarvestProtocol.HARVEST_OAI_PMH;
          break;
        }
      }
      const data = this.initialiseGroupedDatasetData(id, '1234', harvestType);
      const progress = data['dataset-progress'];
      this.addToRegistry(id, data);

      if (appendErrors > 0) {
        progress['dataset-logs'] = Array.from(Array(appendErrors).keys()).map((i: number) => {
          return {
            type: `Error Type ${i}`,
            message: `There was an error of type ${i} in the data`
          };
        });
        if (appendErrors === 13) {
          // Add the warning too (and a non-fatal error)
          progress['record-limit-exceeded'] = true;
        } else {
          progress.status = DatasetStatus.FAILED;
        }
      }
      return data;
    }
  }

  /**
   * addToRegistry
   *
   *  Binds data to burndown and adds it to the dataRegistry
   *
   * @param { string } id - object identity
   * @param { GroupedDatasetData } data
   **/
  addToRegistry(id: string, data: GroupedDatasetData): void {
    const minIdLength = 4;
    const numericId = this.ensureNumeric(id);
    const paddedId = numericId.padEnd(minIdLength, id);
    const statusTargets =
      id.length > minIdLength
        ? id
            .substring(minIdLength, minIdLength + id.length)
            .split('')
            .map((s: string) => {
              return parseInt(s);
            })
        : undefined;

    this.dataRegistry.set(id, data);

    const burnDown = {
      warn: parseInt(paddedId[1]),
      fail: parseInt(paddedId[2]),
      error: parseInt(paddedId[3]),
      statusTargets: statusTargets,
      timesCalled: 1
    };

    timer(1000, 1000)
      .pipe(takeWhile(() => !this.makeProgress(data, burnDown)))
      .subscribe();
  }

  /**
   * ensureNumeric
   *
   * conditionally replaces a string
   *
   * @param ( string ) str - the string to conditionally replace
   * @returns the string as is if it can be parsed to a number, otherwise returns a derived string that can be parsed to a number
   **/
  ensureNumeric(str: string): string {
    return isNaN(parseInt(str))
      ? str.padEnd(1, '1').replace(/[\s\S]/g, function(escape: string) {
          return escape
            .charCodeAt(0)
            .toString(10)
            .slice(-1);
        })
      : str;
  }

  /**
   * handleRecordReportRequest
   *
   * sends error or generated report to response
   *
   * @param {ServerResponse} response - the response object
   * @param {string} route - the route
   * @param {string} datasetIdRaw
   * @param {string} recordIdRaw
   **/
  handleRecordReportRequest(
    response: ServerResponse,
    route: string,
    datasetIdRaw: string,
    recordIdRaw: string
  ): void {
    const recordIdUnparsed = decodeURIComponent(recordIdRaw);
    const recordId = parseInt(recordIdUnparsed);

    if (isNaN(recordId)) {
      // check for mismatches between europeana records and the parent dataset
      const europeanaId = /^\/(\d)\/\S+/.exec(recordIdUnparsed);
      if (europeanaId) {
        const recordDataset = parseInt(europeanaId[1]);
        const datasetParam = parseInt(datasetIdRaw);
        if (recordDataset !== datasetParam) {
          this.handle404(route, response);
          return;
        }
      }
    }
    if (recordIdUnparsed.indexOf('four-o-four') > -1) {
      setTimeout(
        () => {
          this.handle404(route, response);
        },
        isNaN(recordId) ? 0 : recordId
      );
      return;
    } else if (this.errorCodes.indexOf(`${recordId}`) > -1) {
      response.statusCode = recordId;
      response.end();
      return;
    } else {
      const report = this.reportGenerator.generateReport(recordIdUnparsed);
      if (recordId > 999) {
        setTimeout(() => {
          response.end(report);
        }, recordId);
      } else {
        response.end(report);
      }
    }
  }

  /**
   * handleRequest
   *
   * Handles POST data and 404s.
   * Routes valid GET requests to appropriate handler function
   *
   * @param {IncomingMessage} request - the request object
   * @param {ServerResponse} response - the response object
   **/
  handleRequest(request: IncomingMessage, response: ServerResponse): void {
    const route = request.url as string;

    if (request.method === 'OPTIONS') {
      response.setHeader(
        'Access-Control-Allow-Headers',
        'authorization,X-Requested-With,content-type'
      );
      response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
      response.setHeader('Access-Control-Max-Age', '1800');
      response.setHeader('Allow', 'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH');
      response.setHeader('Connection', 'Keep-Alive');
      response.end();
      return;
    }
    if (request.method === 'POST') {
      const regResDebiasRun = /dataset\/([A-Za-z0-9_]+)\/debias/.exec(route);
      if (regResDebiasRun && regResDebiasRun.length > 1) {
        response.end(JSON.stringify(runDebias(regResDebiasRun[1])));
        return;
      }

      const regRes = /\/dataset\/(\S+)\//.exec(route);
      if (regRes) {
        this.newId++;
        this.handleUpload(request, response, regRes[1].split('/')[0]);
        return;
      } else {
        response.end(`{ "error": "invalid url" }`);
      }
    } else {
      if (this.handleScript(route, response)) {
        return;
      } else if (route === '/matomo.js') {
        fileSystem.createReadStream('projects/sandbox/test-data/fake-matomo.js').pipe(response);
        return;
      } else if (route === '/dataset/countries') {
        this.headerJSON(response);
        response.end(
          JSON.stringify(
            ['Bosnia and Herzegovina', 'Greece', 'Hungary', 'Italy'].map((val: string) => {
              return {
                name: val,
                xmlValue: val
              };
            })
          )
        );
        return;
      } else if (route === '/dataset/languages') {
        this.headerJSON(response);
        response.end(
          JSON.stringify(
            ['Bosnian', 'Greek', 'Hungarian', 'Italian'].map((val: string) => {
              return {
                name: val,
                xmlValue: val
              };
            })
          )
        );
        return;
      } else if (route === '/user-datasets') {
        let res: Array<UserDatasetInfo> = [];
        if (this.userId && this.userId.length) {
          const userIdNumeric = parseInt(this.userId) as number;
          const resLength = Math.min(userIdNumeric, mockUserDatasets.length);
          res = [...mockUserDatasets].slice(0, resLength);
        }

        // Append any that the acive user has created

        const existingData = this.dataRegistry.values();
        let existing = existingData.next().value;
        while (existing) {
          if (existing['dataset-info']['created-by-id'] === this.userId) {
            const converted = { ...existing['dataset-info'] };
            const progress = existing['dataset-progress'];
            converted['harvest-protocol'] = existing['harvesting-parameters']
              ? existing['harvesting-parameters']['harvest-protocol']
              : HarvestProtocol.HARVEST_FILE;
            converted['status'] = progress.status;
            converted['total-records'] = progress['total-records'];
            converted['processed-records'] = progress['processed-records'];
            res.push(converted);
          }
          existing = existingData.next().value;
        }
        response.end(JSON.stringify(res));
      } else {
        if (handleDebiasUrls(route, response)) {
          return;
        }

        // get record report
        const regResRecord = /\/dataset\/([A-Za-z0-9_]+)\/record\/compute-tier-calculation\?recordId=(\S+)/.exec(
          route
        );

        if (regResRecord && regResRecord.length > 2) {
          this.handleRecordReportRequest(response, route, regResRecord[1], regResRecord[2]);
          return;
        }

        // get dataset info
        const regResDatasetInfo = /\/dataset\/([A-Za-z0-9_]+)\/info/.exec(route);

        if (regResDatasetInfo) {
          const id = regResDatasetInfo[1];
          if (this.errorCodes.indexOf(id) > -1) {
            response.statusCode = parseInt(id);
            response.end();
          } else {
            this.headerJSON(response);
            response.end(JSON.stringify(this.handleId(id)['dataset-info']));
          }
          return;
        }

        // get dataset progress
        const regResDatasetProgress = /\/dataset\/([A-Za-z0-9_]+)\/progress/.exec(route);

        if (regResDatasetProgress) {
          const id = regResDatasetProgress[1];
          const idNumeric = parseInt(id);
          if (this.errorCodes.indexOf(id) > -1) {
            response.statusCode = parseInt(id);
            response.end();
          } else {
            this.headerJSON(response);
            if (idNumeric > 200 && idNumeric <= 300) {
              response.end(JSON.stringify(this.handleId(id, idNumeric - 200)['dataset-progress']));
            } else {
              const data = this.handleId(id);
              response.end(JSON.stringify(data['dataset-progress']));
            }
          }
          return;
        }

        // get dataset records

        const regRecords = /\/dataset\/([A-Za-z0-9_]+)\/records-tiers/.exec(route);
        if (regRecords && regRecords.length > 1) {
          const id = regRecords[1];
          const idNumeric = parseInt(id);
          const result = JSON.stringify(this.recordGenerator.generateRecords(idNumeric));
          if (idNumeric > 999) {
            setTimeout(() => {
              response.end(result);
            }, idNumeric);
          } else {
            response.end(result);
          }
          return;
        }

        // Content opened in new tabs should close immediately after loading
        const regResNewTab = /^\/dataset/.exec(route);
        if (
          regResNewTab ||
          route.indexOf('debias-uri') > -1 ||
          route.indexOf('preview-url.eu') > -1 ||
          route.indexOf('portal.record.link') > -1 ||
          route.indexOf('this-collection/that-dataset') > -1 ||
          route.indexOf('/media') === 0
        ) {
          const fs = fileSystem.createReadStream('projects/sandbox/test-data/new-tab.html');
          fs.pipe(response);
          return;
        }

        // Problem Patterns
        // (convention: only numerically-odd ids get non-empty results)

        const regProblemPattern = /\/pattern-analysis\/([A-Za-z0-9_]+)\/get/.exec(route);

        if (regProblemPattern && regProblemPattern.length > 1) {
          const id = regProblemPattern[1];
          const idNumeric = parseInt(id);

          if (route.indexOf('get-record-pattern-analysis') > -1) {
            const recordId = /recordId=([A-Za-z0-9_\-%]+)/.exec(route);

            if (recordId && recordId.length > 1) {
              const recordIdNumeric = parseInt(recordId[1]);
              if (this.errorCodes.indexOf(recordId[1]) > -1) {
                response.statusCode = parseInt(recordId[1]);
                response.end();
                return;
              }

              let result = '[]';

              if (recordIdNumeric % 2 === 1) {
                // Add problems as per subsequent characters in the (numeric) dataset id
                result = JSON.stringify([
                  generateProblem(idNumeric, 0, recordId[1]),
                  ...`${idNumeric}`
                    .slice(1)
                    .split('')
                    .map((numericPart: string) => {
                      return generateProblem(idNumeric, parseInt(numericPart));
                    })
                ]);
              }

              this.headerJSON(response);

              if (idNumeric > 999) {
                setTimeout(() => {
                  response.end(result);
                }, idNumeric);
              } else {
                response.end(result);
              }
              return;
            }
            response.end(JSON.stringify([generateProblem(idNumeric, 1)]));
            return;
          } else if (route.indexOf('get-dataset-pattern-analysis') > -1) {
            if (id && this.errorCodes.indexOf(id) > -1) {
              response.statusCode = idNumeric;
              response.end();
              return;
            }

            // return result without the subscription data
            const sendDeserialisedProblems = (
              problems: ProblemPatternsDatasetWithSubscriptionRef
            ): void => {
              response.end(
                JSON.stringify({
                  datasetId: problems.datasetId,
                  problemPatternList: problems.problemPatternList,
                  analysisStatus: problems.analysisStatus
                })
              );
            };

            const data = this.dataRegistry.get(id);

            // handle deletion
            if (route.indexOf(UrlManipulation.RESET_DATASET_PROBLEMS) > -1) {
              if (data && data['dataset-problems']) {
                (data[
                  'dataset-problems'
                ] as ProblemPatternsDatasetWithSubscriptionRef).sub?.unsubscribe();
                delete data['dataset-problems'];
                this.dataRegistry.delete(id);
              }
              response.statusCode = 204;
              response.end();
              return;
            }

            if (data && data['dataset-problems']) {
              this.headerJSON(response);
              sendDeserialisedProblems(data['dataset-problems']);
              return;
            }

            const problemsDataset: ProblemPatternsDatasetWithSubscriptionRef = {
              datasetId: id,
              problemPatternList: [],
              analysisStatus: ProblemPatternAnalysisStatus.PENDING
            };

            // assign empty, pending problemPattern object to GroupedDatasetData

            this.handleId(id)['dataset-problems'] = problemsDataset;

            // incrementally add problems (and assign subscription)

            if (idNumeric % 2 !== 0) {
              problemsDataset.analysisStatus = ProblemPatternAnalysisStatus.IN_PROGRESS;

              const problemCount = 15;
              const sub = of(...Array(problemCount).keys())
                .pipe(concatMap((item) => of(item).pipe(delay(1000))))
                .subscribe((index: number) => {
                  problemsDataset.problemPatternList.push(generateProblem(idNumeric, index));
                  if (index === problemCount - 1) {
                    problemsDataset.analysisStatus = ProblemPatternAnalysisStatus.FINALIZED;
                    sub.unsubscribe();
                  }
                });
              problemsDataset.sub = sub;
            }

            // apply possible delay to response
            setTimeout(
              () => {
                sendDeserialisedProblems(problemsDataset);
              },
              idNumeric > 999 ? idNumeric : 0
            );
            return;
          }
        }
        this.handle404(route, response);
      }
    }
  }
})();
