import { concatMap, of, takeWhile, timer } from 'rxjs';
import { delay } from 'rxjs/operators';
import * as url from 'url';
import * as fileSystem from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server.mjs';

import { isoLanguageCodes, isoLanguageNames } from './src-copy/static-country-data.mjs';
import {
  DatasetInfo,
  DatasetStatus,
  HarvestProtocol,
  HarvestType,
  ProgressByStep,
  StepStatus,
  TierInfo,
  UserDatasetInfo
} from './src-copy/progress-info.mjs';
import { ProblemPatternAnalysisStatus } from './src-copy/problem-patterns.mjs'
import {
  SubmissionResponseData
} from '../src/app/_models';

import { handleDebiasUrls, runDebias } from './data/debias.mjs';
import { stepErrorDetails } from './data/step-error-detail.mjs';
import { mockUserDatasets } from './data/mocked-progress-info.mjs';

import { RecordGenerator } from './data/record-generator.mjs';
import { ReportGenerator } from './data/report-generator.mjs';
import { generateProblem } from './data/problem-pattern-generator.mjs';
import {
  GroupedDatasetData,
  ProblemPatternsDatasetWithSubscriptionRef,
  ProgressBurndown,
  ProgressByStepStatus,
  UrlManipulation
} from './models/models.mjs';

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

  harvestProtocolToHarvestType(protocol: HarvestProtocol): HarvestType {
    if (protocol === HarvestProtocol.HARVEST_FILE) {
      return HarvestType.FILE;
    } else if (protocol === HarvestProtocol.HARVEST_HTTP) {
      return HarvestType.HTTP;
    } else {
      return HarvestType.OAI;
    }
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
    } else if (datasetName === '413') {
      this.headerText(response);
      response.statusCode = 413;
      response.end(
        JSON.stringify({
          message: 'Maximum upload size of 67108864 bytes exceeded',
          status: 'PAYLOAD_TOO_LARGE',
          statusCode: 413
        })
      );
      return;
    }

    const params = url.parse(route, true).query;
    const getParam = (name: string): string => {
      return params[name] as string;
    };

    const harvestProtocol =
      route.indexOf('harvestOaiPmh') > -1
        ? HarvestProtocol.HARVEST_OAI
        : route.indexOf('harvestByUrl') > -1
        ? HarvestProtocol.HARVEST_HTTP
        : HarvestProtocol.HARVEST_FILE;

    const country = getParam('country');

    const data = this.initialiseGroupedDatasetData(
      `${this.newId}`,
      `${this.userId}`,
      harvestProtocol,
      datasetName,
      country[0].toUpperCase() + country.slice(1).toLowerCase(),
      getParam('language'),
      getParam('stepsize'),
      getParam('setspec')
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

      (res as any)[name] = value;
      datasetInfo['harvesting-parameters'] = res;
    };

    if ([HarvestProtocol.HARVEST_FILE, HarvestProtocol.HARVEST_HTTP].includes(harvestProtocol)) {
      addNewDatasetInfoField('file-type', 'file.zip');
      addNewDatasetInfoField('file-name', 'file-name');
    }

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
   * @returns {ProgressBurndown}
   **/
  initialiseProgressByStep(step: StepStatus, totalRecords: number): ProgressBurndown {
    const res = {
      error: 0,
      fail: 0,
      warn: 0,
      success: 0,
      timesCalled: 0,
      total: 0,
      totalPossible: totalRecords
    };
    ((res as unknown) as ProgressByStep).step = step;
    return res;
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
    harvestProtocol: HarvestProtocol,
    datasetName?: string,
    country?: string,
    language?: string,
    stepSize?: string,
    setSpec?: string
  ): GroupedDatasetData {
    const idAsNumber = parseInt(datasetId[0]);
    const totalRecords = idAsNumber;
    const steps = Object.values(StepStatus).filter((step: StepStatus) => {
      return ![
        HarvestProtocol.HARVEST_OAI,
        HarvestProtocol.HARVEST_HTTP,
        HarvestProtocol.HARVEST_FILE
      ].includes((step as unknown) as HarvestProtocol);
    });
    steps.unshift((harvestProtocol as unknown) as StepStatus);

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
        'harvest-protocol': this.harvestProtocolToHarvestType(harvestProtocol),
        'step-size': stepSize ?? '1'
      }
    };

    const harvestingParams = datasetInfo['harvesting-parameters'];

    if (harvestProtocol === HarvestProtocol.HARVEST_OAI) {
      harvestingParams.url = 'http://default-oai-url';
      harvestingParams['set-spec'] = setSpec;
      harvestingParams['metadata-format'] = 'default-metadata-format';
    } else if (harvestProtocol === HarvestProtocol.HARVEST_HTTP) {
      harvestingParams.url = 'http://default-http-url';
    } else if (harvestProtocol === HarvestProtocol.HARVEST_FILE) {
      harvestingParams['file-name'] = 'file.zip';
      harvestingParams['file-type'] = 'zip';
    }

    return {
      'dataset-info': datasetInfo,
      'execution-progress-info': {
        status: DatasetStatus.IN_PROGRESS,
        'record-limit-exceeded': !!(datasetName && datasetName.length > 10),
        'total-records': totalRecords,
        'error-type': datasetId === '13' ? 'The process failed bigly' : '',
        'processed-records': 0,
        'progress-by-step': steps.map((key: StepStatus) => {
          return this.initialiseProgressByStep(key, totalRecords) as unknown;
        }) as Array<ProgressByStep>,
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
    const dataset = data['execution-progress-info'];
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
   * @return true if processing is complete
   **/
  makeProgress(data: GroupedDatasetData, burndown: ProgressBurndown): boolean {
    const dataset = data['execution-progress-info'];
    const pbsArray = dataset['progress-by-step'];

    if (dataset['processed-records'] === dataset['total-records']) {
      if (dataset.status !== DatasetStatus.FAILED) {
        if (pbsArray[pbsArray.length - 1].success > 0) {
          dataset.status = DatasetStatus.COMPLETED;
          dataset['processed-records'] = pbsArray[pbsArray.length - 1].success;
          if (dataset['processed-records']) {
            dataset['portal-preview'] =
              'http://localhost:3000/this-collection/that-dataset/publish';
          }
        } else {
          dataset.status = DatasetStatus.FAILED;
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
      return true;
    }

    // Add tierzero warnings
    this.makeProgressTierZero(data, burndown.timesCalled);

    // burn down the progress
    const shiftField =
      burndown.warn > 0
        ? ProgressByStepStatus.WARN
        : burndown.fail > 0
        ? ProgressByStepStatus.FAIL
        : ProgressByStepStatus.SUCCESS;

    let key = 0;
    const targetPbs = pbsArray.find((pbsItem: ProgressByStep, index: number) => {
      let res = false;
      const totalPossible = ((pbsItem as unknown) as ProgressBurndown).totalPossible;

      res = pbsItem.success + pbsItem.fail + pbsItem.warn < totalPossible;
      if (res) {
        key = index;
      }
      return res;
    });

    if (targetPbs) {
      if (shiftField !== ProgressByStepStatus.SUCCESS) {
        targetPbs[shiftField] += 1;

        const addError = (): void => {
          const errorNum = dataset['processed-records'];
          const error = {
            type:
              (errorNum % 2 === 0 ? ProgressByStepStatus.WARN : ProgressByStepStatus.FAIL) +
              ` (${errorNum})`,
            message: stepErrorDetails[errorNum % stepErrorDetails.length],
            records: [`${errorNum}`, `${key}`, `${errorNum * key}`]
          };
          if (targetPbs.errors) {
            targetPbs.errors.push(error);
          } else {
            targetPbs.errors = [error];
          }
        };

        if (shiftField === ProgressByStepStatus.WARN && burndown.warn > 1) {
          addError();
        }

        if (shiftField === ProgressByStepStatus.FAIL && burndown.error > 0) {
          addError();
          burndown.error--;

          // carry over
          for (let i = key; i + 1 < pbsArray.length; i++) {
            ((pbsArray[i + 1] as unknown) as ProgressBurndown).totalPossible--;
          }
        }
      } else {
        // no shift field means success
        targetPbs[ProgressByStepStatus.SUCCESS] += 1;
      }

      if (key === pbsArray.length - 1) {
        dataset['processed-records'] += 1;
      }

      const pbd = (targetPbs as unknown) as ProgressBurndown;
      targetPbs.total = pbd.totalPossible;
    } else {
      dataset['processed-records'] += 1;
    }

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
   * The id "4032" will be interpreted as having:
   *  - 4 records in total
   *  - 0 warn
   *  - 3 fail
   *  - 2 errors
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
          harvestType = HarvestProtocol.HARVEST_OAI;
          break;
        }
      }
      const data = this.initialiseGroupedDatasetData(id, '1234', harvestType);
      const progress = data['execution-progress-info'];
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
  addToRegistry(id: string, data: GroupedDatasetData, total = 0): void {
    const minIdLength = 4;
    const numericId = this.ensureNumeric(id);
    const paddedId = numericId.padEnd(minIdLength, id);

    this.dataRegistry.set(id, data);

    const burnDown = {
      warn: parseInt(paddedId[1]),
      fail: parseInt(paddedId[2]),
      error: parseInt(paddedId[3]),
      total: total,
      success: 0,
      totalPossible: total,
      timesCalled: 1
    };

    timer(1000, 100)
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
            ['BOSNIAAND_HERZEGOVINA', 'Greece', 'Hungary', 'Italy'].map((val: string) => {
              return {
                name: val.toUpperCase(),
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
                name: isoLanguageCodes[val] ? isoLanguageCodes[val].toUpperCase() : val,
                xmlValue: val
              };
            })
          )
        );
        return;
      } else if (route === '/users/me/datasets') {
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
            converted['harvest-protocol'] = existing['harvesting-parameters']
              ? existing['harvesting-parameters']['harvest-protocol']
              : HarvestType.FILE;

            // temporarily disable index
            /*
            const progress = existing['execution-progress-info'];
            converted['status'] = progress.status;
            converted['total-records'] = progress['total-records'];
            converted['processed-records'] = progress['processed-records'];
            */
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
            const res = structuredClone(this.handleId(id)['dataset-info']);
            // Match the actual back-end response
            res.language = isoLanguageNames[res.language.toLowerCase()] ?? res.language;
            // Match the actual back-end response
            res.country = res.country[0].toUpperCase() + res.country.slice(1).toLowerCase();
            response.end(JSON.stringify(res));
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
              response.end(
                JSON.stringify(this.handleId(id, idNumeric - 200)['execution-progress-info'])
              );
            } else {
              const data = this.handleId(id);
              response.end(JSON.stringify(data['execution-progress-info']));
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
            const matcher = /recordId=([A-Za-z0-9_\-%]+)/.exec(route);

            if (matcher && matcher.length > 1) {

              const recordId = decodeURIComponent(matcher[1]).split('/').filter((x)=>!!x).pop();

              if(recordId){

              const recordIdNumeric = parseInt(recordId);
              if (this.errorCodes.indexOf(recordId) > -1) {
                response.statusCode = parseInt(recordId);
                response.end();
                return;
              }

              let result = '[]';

              if (recordIdNumeric % 2 === 1) {
                // Add problems as per subsequent characters in the (numeric) dataset id
                result = JSON.stringify([
                  generateProblem(idNumeric, 0, recordId),
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
