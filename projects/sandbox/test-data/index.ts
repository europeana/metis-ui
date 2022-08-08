import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import { problemPatternData } from '../src/app/_data';
import {
  Dataset,
  DatasetStatus,
  FieldOption,
  ProblemPattern,
  ProblemPatternId,
  ProblemPatternsDataset,
  ProgressByStep,
  StepStatus,
  SubmissionResponseData,
  TierInfo
} from '../src/app/_models';
import { stepErrorDetails } from './data/step-error-detail';
import { ProgressByStepStatus, TimedTarget } from './models/models';
import { ReportGenerator } from './report-generator';

new (class extends TestDataServer {
  serverName = 'sandbox';
  errorCodes: Array<string>;
  newId = 0;
  timedTargets: Map<string, TimedTarget> = new Map<string, TimedTarget>();
  reportGenerator: ReportGenerator;

  /**
   * constructor
   *
   * generate the error codes
   * initialise the progress timer
   **/
  constructor() {
    super();

    this.reportGenerator = new ReportGenerator();

    const generateRange = (start: number, end: number): Array<string> => {
      return [...Array(1 + end - start).keys()].map((v: number) => {
        return `${start + v}`;
      });
    };

    this.errorCodes = generateRange(400, 418).concat(generateRange(500, 508));

    const tick = (): void => {
      this.timedTargets.forEach((tgt: TimedTarget) => {
        tgt.timesCalled += 1;
        this.makeProgress(tgt);
      });
    };
    setInterval(tick, 1000);
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
   * initialiseDataset
   *
   * Initialises and returns a new Dataset object
   *
   * @param {number} totalRecords - the value for the result's 'total-records'
   * @returns {Dataset}
   **/
  initialiseDataset(
    datasetId: string,
    harvestType: StepStatus.HARVEST_OAI_PMH | StepStatus.HARVEST_HTTP | StepStatus.HARVEST_ZIP,
    datasetName?: string,
    country?: string,
    language?: string
  ): Dataset {
    const idAsNumber = parseInt(datasetId[0]);
    const totalRecords = idAsNumber;
    const steps = Object.values(StepStatus).filter((step: StepStatus) => {
      return ![
        StepStatus.HARVEST_OAI_PMH,
        StepStatus.HARVEST_HTTP,
        StepStatus.HARVEST_ZIP
      ].includes(step);
    });
    steps.unshift(harvestType);

    const createEmptyTier = (): TierInfo => {
      return { samples: [], total: 0 } as TierInfo;
    };

    const tierZeroInfo =
      idAsNumber % 2 === 0
        ? undefined
        : idAsNumber % 3 === 0
        ? {
            'content-tier': createEmptyTier(),
            'metadata-tier': createEmptyTier()
          }
        : {
            'content-tier': createEmptyTier()
          };

    return {
      status: DatasetStatus.IN_PROGRESS,
      'total-records': totalRecords,
      'processed-records': 0,
      'progress-by-step': steps.map((key: StepStatus) => {
        return this.initialiseProgressByStep(key, totalRecords);
      }),
      'dataset-info': {
        'creation-date': `${new Date().toISOString()}`,
        'dataset-id': datasetId,
        'dataset-name': datasetName ? datasetName : 'GeneratedName',
        country: country ? country : 'GeneratedCountry',
        language: language ? language : 'GeneratedLanguage',
        'transformed-to-edm-external': country === 'Greece',
        'record-limit-exceeded': !!(datasetName && datasetName.length > 10)
      },
      'tier-zero-info': tierZeroInfo
    };
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

    if (dataset['processed-records'] === dataset['total-records']) {
      dataset.status = DatasetStatus.COMPLETED;
      if (timedTarget.timesCalled >= 5) {
        dataset['portal-publish'] = 'http://this-collection/that-dataset/publish';
      }
      return;
    }
    dataset['processed-records'] += 1;

    // Add tierzero warnings
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
            for (let i = 0; i < Math.pow(item.mod, 3); i++) {
              if (info.samples.length < maxRecordListLength) {
                info.samples.push(
                  `Record_id_XYZABC__C3PO_GTXXX_SDF_76_14_${item.tier}_${datasetInfo['dataset-id']}`
                );
              }
            }
          }
        }
      });
    }

    // burn down the progress
    const burndown = timedTarget.progressBurndown;
    const shiftField =
      burndown.warn > 0
        ? ProgressByStepStatus.WARN
        : burndown.fail > 0
        ? ProgressByStepStatus.FAIL
        : ProgressByStepStatus.SUCCESS;
    const pbsArray = dataset['progress-by-step'];
    const statusTargets = burndown.statusTargets
      ? burndown.statusTargets
      : Array.from(pbsArray.keys());

    pbsArray.forEach((pbs: ProgressByStep, key: number) => {
      if (shiftField !== ProgressByStepStatus.SUCCESS && statusTargets.indexOf(key) > -1) {
        pbs[shiftField] += 1;
        if (shiftField === ProgressByStepStatus.FAIL && burndown.error > 0) {
          const errorNum = dataset['processed-records'];
          const error = {
            type: `warnng (${errorNum})`,
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
   * Retrieves or creates a TimedTarget object with the supplied id and
   * ends the response with its dataset data.
   *
   * The id "42001357" will be interpreted as having:
   *  - 4 records in total
   *  - 2 warn
   *  - 0 fail
   *  - 0 errors
   *  - 1,3,5,7 will be the 'progress-by-step' items to apply the (non success) statuses to
   *
   *  @param {ServerResponse} response - the server response object
   *  @param {string} id - the id to track
   **/
  handleId(response: ServerResponse, id: string): void {
    const timedTarget = this.timedTargets.get(id);
    this.headerJSON(response);
    if (timedTarget) {
      response.end(JSON.stringify(timedTarget.dataset));
    } else {
      const numericId = parseInt(this.ensureNumeric(id[0]));
      let harvestType = StepStatus.HARVEST_ZIP;

      switch (numericId % 3) {
        case 0: {
          harvestType = StepStatus.HARVEST_ZIP;
          break;
        }
        case 1: {
          harvestType = StepStatus.HARVEST_HTTP;
          break;
        }
        case 2: {
          harvestType = StepStatus.HARVEST_OAI_PMH;
          break;
        }
      }
      const dataset = this.initialiseDataset(id, harvestType);
      this.addTimedTarget(id, dataset);
      response.end(JSON.stringify(dataset));
    }
  }

  /**
   * addTimedTarget
   *
   *  Derives progressBurndown data and adds it to a TimedTarget
   *
   * @param { string } id - object identity
   * @param { Dataset } dataset - the timed target dataset
   **/
  addTimedTarget(id: string, dataset: Dataset): void {
    const minIdLength = 4;
    const numericId = this.ensureNumeric(id);
    const paddedId = numericId.padEnd(minIdLength, id);
    const statusTargets =
      id.length > minIdLength
        ? id
            .substr(minIdLength, id.length)
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
   * @param ( string ) recordId
   **/
  generateProblem(datasetId: number, patternId: number, recordId?: string): ProblemPattern {
    const messageReports = {
      P1: ['My Title', 'My Other Title'],
      P2: [
        'The Descriptive Title',
        'The Descriptive Title: Which Is It?',
        'The Descriptive Title: 2-in-1'
      ],
      P3: ['Cultural Heritage Object'],
      P5: ['**$!^#-_-#^!$**', 'xxxxxxxxxxxx'],
      P6: ['aaaaaaa', 'zzzzzzz'],
      P7: ['', '/', '/na'],
      P9: ['Title', 'A1'],
      P12: ['Urbano dejanje 2015 the courtyard - also known as the yard of the court']
    };

    const patternIds = [1, 2, 3, 5, 6, 7, 9, 12].map((id: number) => {
      return `P${id}` as ProblemPatternId;
    });

    const resultId = patternIds[patternId % patternIds.length];

    const occurenceList = new Array(Math.max(1, (datasetId + patternId) % 4))
      .fill(null)
      .map((_, occurenceIndex) => {
        const messageReportGroup = messageReports[resultId];
        return {
          recordId: recordId ? decodeURIComponent(recordId) : '/X/generated-record-id',
          problemOccurrenceList: [
            {
              messageReport: messageReportGroup[occurenceIndex % messageReportGroup.length],
              affectedRecordIds: Object.keys(new Array(occurenceIndex % 5).fill(null)).map((i) => {
                return `/${datasetId}/${occurenceIndex + i}`;
              })
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

        const datasetName = regRes[1].split('/')[0];
        const params = url.parse(route, true).query;
        const getParam = (name: string): string => {
          return params[name] as string;
        };

        if (datasetName === '404') {
          this.handle404(route, response);
          return;
        }

        let harvestType = StepStatus.HARVEST_ZIP;
        if (params.url) {
          if (params.metadataformat) {
            harvestType = StepStatus.HARVEST_OAI_PMH;
          } else {
            harvestType = StepStatus.HARVEST_HTTP;
          }
        }

        const dataset = this.initialiseDataset(
          `${this.newId}`,
          harvestType,
          datasetName,
          getParam('country'),
          getParam('language')
        );

        this.addTimedTarget(`${this.newId}`, dataset);

        this.headerJSON(response);
        response.end(
          JSON.stringify({
            'dataset-id': `${this.newId}`,
            'duplicate-records': 0,
            'records-to-process': 0
          } as SubmissionResponseData)
        );
      } else {
        response.end(`{ "error": "invalid url" }`);
      }
    } else {
      if (route === '/dataset/countries') {
        this.headerJSON(response);
        response.end(
          JSON.stringify([
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

          if (this.errorCodes.indexOf(`${recordId}`) > -1) {
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

        const regResDataset = /\/dataset\/([A-Za-z0-9_]+)$/.exec(route);

        if (regResDataset) {
          const id = regResDataset[1];
          if (this.errorCodes.indexOf(id) > -1) {
            response.statusCode = parseInt(id);
            response.end();
          } else {
            this.handleId(response, id);
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
              } else {
                const result =
                  recordIdNumeric % 2 === 0
                    ? '[]'
                    : JSON.stringify([this.generateProblem(idNumeric, 0, recordId[1])]);
                if (idNumeric > 999) {
                  setTimeout(() => {
                    response.end(result);
                  }, idNumeric);
                } else {
                  response.end(result);
                }
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
              executionTimestamp: `${new Date().toISOString()}`,
              problemPatternList:
                idNumeric % 2 === 0
                  ? []
                  : Object.keys(new Array(15).fill(null)).map((i) => {
                      return this.generateProblem(idNumeric, parseInt(i));
                    })
            } as ProblemPatternsDataset;

            if (idNumeric > 999) {
              setTimeout(() => {
                response.end(JSON.stringify(problemsDataset));
              }, idNumeric);
            } else {
              response.end(JSON.stringify(problemsDataset));
            }
            return;
          }
        }
        this.handle404(route, response);
      }
    }
  }
})();
