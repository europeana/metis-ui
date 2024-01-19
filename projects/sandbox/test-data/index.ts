import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import { problemPatternData } from '../src/app/_data';
import {
  DatasetInfo,
  DatasetProgress,
  DatasetStatus,
  FieldOption,
  HarvestProtocol,
  ProblemPattern,
  ProblemPatternId,
  ProblemPatternsDataset,
  ProgressByStep,
  StepStatus,
  SubmissionResponseData,
  TierInfo
} from '../src/app/_models';
import { stepErrorDetails } from './data/step-error-detail';
import { ProgressByStepStatus, ProgressWithInfo, TimedTarget } from './models/models';
import { RecordGenerator } from './record-generator';
import { ReportGenerator } from './report-generator';

new (class extends TestDataServer {
  serverName = 'sandbox';
  errorCodes: Array<string>;
  newId = 0;
  timedTargets: Map<string, TimedTarget> = new Map<string, TimedTarget>();
  recordGenerator: RecordGenerator;
  reportGenerator: ReportGenerator;

  /**
   * constructor
   *
   * generate the error codes
   * initialise the progress timer
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

    const tick = (): void => {
      this.timedTargets.forEach((tgt: TimedTarget) => {
        if (!tgt.complete) {
          tgt.timesCalled += 1;
          this.makeProgress(tgt);
        }
      });
    };
    setInterval(tick, 1000);
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

    const progressWithInfo = this.initialiseProgressWithInfo(
      `${this.newId}`,
      harvestType,
      datasetName,
      getParam('country'),
      getParam('language')
    );

    // Set up timed target and send response
    this.addTimedTarget(`${this.newId}`, progressWithInfo);
    this.headerJSON(response);
    response.end(
      JSON.stringify({
        'dataset-id': `${this.newId}`,
        'duplicate-records': 0,
        'records-to-process': 0
      } as SubmissionResponseData)
    );

    // Temporary function to add non-model (parameter) fields
    const addNewDatasetInfoField = (name: string, value: string | boolean): void => {
      const res = progressWithInfo['dataset-info']['harvesting-parameters'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (res as any)[name] = value;
      progressWithInfo['dataset-info']['harvesting-parameters'] = res;
    };

    request.on('data', (data) => {
      data = `${data}`;
      if (data.indexOf('filename=') > -1) {
        const fName = /"[A-Za-z_-\d]*.[\d]*"/.exec(data);
        if (fName) {
          if (data.indexOf('name="dataset"') > -1) {
            const fileName = fName[0].replace(/["]/g, '');
            addNewDatasetInfoField('file-type', fileName.split('.')[1]);
            addNewDatasetInfoField('file-name', fileName);
          }
          if (data.indexOf('name="xsltFile"') > -1) {
            progressWithInfo['dataset-info']['transformed-to-edm-external'] = true;
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
   * initialiseProgressWithInfo
   *
   * Initialises and returns a new ProgressWithInfo object
   *
   * @param {number} totalRecords - the value for the result's 'total-records'
   * @returns {ProgressWithInfo}
   **/
  initialiseProgressWithInfo(
    datasetId: string,
    harvestType:
      | HarvestProtocol.HARVEST_OAI_PMH
      | HarvestProtocol.HARVEST_HTTP
      | HarvestProtocol.HARVEST_FILE,
    datasetName?: string,
    country?: string,
    language?: string
  ): ProgressWithInfo {
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
      'dataset-id': datasetId,
      'dataset-name': datasetName ? datasetName : 'GeneratedName',
      country: country ? country : 'GeneratedCountry',
      language: language ? language : 'GeneratedLanguage',
      'harvesting-parameters': {
        'harvest-protocol': harvestType
      }
    };

    if (harvestType === HarvestProtocol.HARVEST_OAI_PMH) {
      datasetInfo['harvesting-parameters'].url = 'http://default-oai-url';
      datasetInfo['harvesting-parameters']['set-spec'] = 'default-set-spec';
      datasetInfo['harvesting-parameters']['metadata-format'] = 'default-metadata-format';
    } else if (harvestType === HarvestProtocol.HARVEST_HTTP) {
      datasetInfo['harvesting-parameters'].url = 'http://default-http-url';
    } else if (harvestType === HarvestProtocol.HARVEST_FILE) {
      datasetInfo['harvesting-parameters']['file-name'] = 'file.zip';
      datasetInfo['harvesting-parameters']['file-type'] = 'zip';
    }

    return {
      status: DatasetStatus.IN_PROGRESS,
      'record-limit-exceeded': !!(datasetName && datasetName.length > 10),
      'records-published-successfully': true,
      'total-records': totalRecords,
      'error-type': datasetId === '13' ? 'The process failed bigly' : '',
      'processed-records': 0,
      'progress-by-step': steps.map((key: StepStatus) => {
        return this.initialiseProgressByStep(key, totalRecords);
      }),
      'dataset-info': datasetInfo,
      'dataset-logs': [],
      'tier-zero-info': tierZeroInfo
    };
  }

  /**
   * makeProgressTierZero
   *
   * Adds content to the TimedTarget.dataset['tier-zero-info'] object
   *
   * @param { TimedTarget } timedTarget - the TimedTarget object to operate on
   **/
  makeProgressTierZero(timedTarget: TimedTarget, add?: number): void {
    const dataset = timedTarget.dataset;
    const maxRecordListLength = 10;
    const datasetInfo = dataset['dataset-info'];
    const tierZeroInfo = dataset['tier-zero-info'];

    if (datasetInfo && tierZeroInfo) {
      [
        { tier: 'content-tier', mod: 2 },
        { tier: 'metadata-tier', mod: 3 }
      ].forEach((item) => {
        if (timedTarget.timesCalled % item.mod === 0) {
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
   * Bumps fields in the TimedTarget.dataset object making corresponding
   * depletions to fields in the TimedTarget.progressBurndown object
   *
   * @param { TimedTarget } timedTarget - the TimedTarget object to operate on
   **/
  makeProgress(timedTarget: TimedTarget): void {
    const dataset = timedTarget.dataset;
    const pbsArray = dataset['progress-by-step'];

    if (dataset['processed-records'] === dataset['total-records']) {
      // early exit...
      if (dataset.status !== DatasetStatus.FAILED) {
        dataset.status = DatasetStatus.COMPLETED;
      }
      if (timedTarget.timesCalled >= 5) {
        dataset['portal-publish'] = 'http://this-collection/that-dataset/publish';
      }
      const tierZeroInfo = dataset['tier-zero-info'];
      if (tierZeroInfo) {
        const ct = tierZeroInfo['content-tier'];
        const mt = tierZeroInfo['metadata-tier'];
        if ((ct && ct.samples.length === 0) || (mt && mt.samples.length === 0)) {
          this.makeProgressTierZero(timedTarget, 1);
        }
      }
      dataset['records-published-successfully'] =
        pbsArray[pbsArray.length - 1][ProgressByStepStatus.SUCCESS] > 0;
      timedTarget.complete = true;
      return;
    }

    dataset['processed-records'] += 1;

    // Add tierzero warnings
    this.makeProgressTierZero(timedTarget);

    // burn down the progress
    const burndown = timedTarget.progressBurndown;
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
            type: (errorNum % 2 === 0 ? 'WARN' : 'FAIL') + ` (${errorNum})`,
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
  }

  /**
   * handleId
   *
   * Retrieves or creates a TimedTarget object with the supplied id
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
  handleId(id: string, appendErrors = 0): ProgressWithInfo {
    const timedTarget = this.timedTargets.get(id);
    if (timedTarget) {
      return timedTarget.dataset;
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
      const progressWithInfo = this.initialiseProgressWithInfo(id, harvestType);
      this.addTimedTarget(id, progressWithInfo);

      if (appendErrors > 0) {
        progressWithInfo['dataset-logs'] = Array.from(Array(appendErrors).keys()).map(
          (i: number) => {
            return {
              type: `Error Type ${i}`,
              message: `There was an error of type ${i} in the data`
            };
          }
        );
        if (appendErrors === 13) {
          // Add the warning too (and a non-fatal error)
          progressWithInfo['record-limit-exceeded'] = true;
        } else {
          progressWithInfo.status = DatasetStatus.FAILED;
        }
      }
      return progressWithInfo;
    }
  }

  /**
   * addTimedTarget
   *
   *  Derives progressBurndown data and adds it to a TimedTarget
   *
   * @param { string } id - object identity
   * @param { ProgressWithInfo } dataset - the timed target dataset
   **/
  addTimedTarget(id: string, dataset: ProgressWithInfo): void {
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

    this.timedTargets.set(id, {
      progressBurndown: {
        warn: parseInt(paddedId[1]),
        fail: parseInt(paddedId[2]),
        error: parseInt(paddedId[3]),
        statusTargets: statusTargets
      },
      dataset: dataset,
      timesCalled: 0
    });
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
   * generateProblem
   *
   * @param ( number ) datasetId
   * @param ( number ) patternIdIndex
   * @param ( string ) recordId
   **/
  generateProblem(datasetId: number, patternIdIndex: number, recordId?: string): ProblemPattern {
    const messageReports = {
      P1: ['My Title', 'My Other Title', "Can't people think of original titles?"],
      P2: [
        'The Descriptive Title',
        `The Descriptive Title: when all the good titles were taken
        they inevitably started to evolve into titles that were
        more descriptive in syntax.`,
        'The Descriptive Title: 2-in-1'
      ],
      P3: ['Cultural Heritage Object'],
      P5: ['**$!^#-_-#^!$**', 'xxxxxxxxxxxx'],
      P6: ['aaaaaaa', 'zzzzzzz'],
      P7: ['', '/', '/na'],
      P9: ['Title', 'A1'],
      P12: [
        `This value is 255 characters long, which is the maximum length it can be.
        This means that this value – shown in light yellow – can occupy a lot of
        real estate.  It will line-wrap, though how often it line-wraps would depend
        on the width of its container.`
      ]
    };

    let indexMatch = -1;

    const patternIds = [1, 2, 3, 5, 6, 7, 9, 12].map((id: number, index: number) => {
      if (recordId && recordId.indexOf(`${id}`) === 0) {
        indexMatch = index;
      }
      return `P${id}` as ProblemPatternId;
    });

    const resultId = patternIds[indexMatch > -1 ? indexMatch : patternIdIndex % patternIds.length];

    let occurrenceCount = Math.max(1, (datasetId + patternIdIndex) % 4);

    if (recordId && recordId.indexOf('x') > -1) {
      const index = recordId.indexOf('x') + 1;
      const multiplier = parseInt(recordId.substring(index, index + recordId.length));
      if (!isNaN(multiplier)) {
        occurrenceCount = occurrenceCount * multiplier;
      }
    } else if (resultId === 'P1' && patternIdIndex === 0) {
      occurrenceCount += 1;
    }

    const occurenceList = new Array(occurrenceCount).fill(null).map((_, occurenceIndex) => {
      const messageReportGroup = messageReports[resultId];
      return {
        recordId: recordId ? decodeURIComponent(recordId) : '/X/generated-record-id',
        problemOccurrenceList: [
          {
            messageReport: messageReportGroup[occurenceIndex % messageReportGroup.length],
            affectedRecordIds: Object.keys(new Array((occurenceIndex % 5) + 2).fill(null)).map(
              (i, index) => {
                let suffix = '';
                if ((occurenceIndex + index) % 2 > 0) {
                  suffix =
                    '/artificially-long-to-test-line-wrapping-within-the-affected-records-list';
                }
                return `/${datasetId}/${occurenceIndex + i}/${suffix}`;
              }
            )
          }
        ]
      };
    });

    return {
      problemPatternDescription: {
        problemPatternId: resultId,
        problemPatternSeverity: problemPatternData[resultId].problemPatternSeverity,
        problemPatternQualityDimension: problemPatternData[resultId].problemPatternQualityDimension,
        problemPatternTitle: problemPatternData[resultId].problemPatternTitle
      },
      recordOccurrences: occurenceList.length,
      recordAnalysisList: occurenceList
    } as ProblemPattern;
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
      const regRes = /\/dataset\/(\S+)\//.exec(route);
      if (regRes) {
        this.newId++;
        this.handleUpload(request, response, regRes[1].split('/')[0]);
        return;
      } else {
        response.end(`{ "error": "invalid url" }`);
      }
    } else {
      if (route === '/dataset/countries') {
        this.headerJSON(response);
        response.end(
          JSON.stringify([
            {
              name: 'Bosnia and Herzogovina',
              xmlValue: 'Bosnia and Herzogovina'
            },
            {
              name: 'Greece',
              xmlValue: 'Greece'
            },
            {
              name: 'Hungary',
              xmlValue: 'Hungary'
            },
            {
              name: 'Italy',
              xmlValue: 'Italy'
            }
          ] as Array<FieldOption>)
        );
      } else if (route === '/dataset/languages') {
        this.headerJSON(response);
        response.end(
          JSON.stringify([
            {
              name: 'Bosnian',
              xmlValue: 'Bosnian'
            },
            {
              name: 'Greek',
              xmlValue: 'Greek'
            },
            {
              name: 'Hungarian',
              xmlValue: 'Hungarian'
            },
            {
              name: 'Italian',
              xmlValue: 'Italian'
            }
          ] as Array<FieldOption>)
        );
      } else {
        const regResRecord = /\/dataset\/([A-Za-z0-9_]+)\/record\/compute-tier-calculation\?recordId=(\S+)/.exec(
          route
        );

        if (regResRecord && regResRecord.length > 2) {
          const recordIdUnparsed = decodeURIComponent(regResRecord[2]);
          const recordId = parseInt(recordIdUnparsed);

          if (isNaN(recordId)) {
            // check for mismatches between europeana records and the parent dataset

            const europeanaId = /^\/(\d)\/\S+/.exec(recordIdUnparsed);
            if (europeanaId) {
              const recordDataset = parseInt(europeanaId[1]);
              const datasetParam = parseInt(regResRecord[1]);
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
              response.end(JSON.stringify(this.handleId(id, idNumeric - 200)));
            } else {
              const resWithInfo = this.handleId(id);
              const res: DatasetProgress = structuredClone(resWithInfo);
              // remove internal info object before sending
              delete ((res as unknown) as { 'dataset-info'?: DatasetInfo })['dataset-info'];
              response.end(JSON.stringify(res));
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
                  this.generateProblem(idNumeric, 0, recordId[1]),
                  ...`${idNumeric}`
                    .slice(1)
                    .split('')
                    .map((numericPart: string) => {
                      return this.generateProblem(idNumeric, parseInt(numericPart));
                    })
                ]);
              }

              if (idNumeric > 999) {
                setTimeout(() => {
                  response.end(result);
                }, idNumeric);
              } else {
                response.end(result);
              }
              return;
            }
            response.end(JSON.stringify([this.generateProblem(idNumeric, 1)]));
            return;
          } else if (route.indexOf('get-dataset-pattern-analysis') > -1) {
            if (id && this.errorCodes.indexOf(id) > -1) {
              response.statusCode = idNumeric;
              response.end();
              return;
            }

            const problemsDataset = {
              datasetId: id,
              executionTimestamp: this.newDateString(),
              problemPatternList:
                idNumeric % 2 === 0
                  ? []
                  : Object.keys(new Array(15).fill(null)).map((i) => {
                      return this.generateProblem(idNumeric, parseInt(i));
                    })
            } as ProblemPatternsDataset;

            // apply possible delay to response
            setTimeout(
              () => {
                response.end(JSON.stringify(problemsDataset));
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
