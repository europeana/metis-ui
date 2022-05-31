import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import {
  Dataset,
  DatasetStatus,
  FieldOption,
  ProblemPattern,
  ProblemPatternId,
  ProblemPatternQualityDimension,
  ProblemPatternsDataset,
  ProblemPatternSeverity,
  ProgressByStep,
  StepStatus,
  SubmissionResponseData
} from '../src/app/_models';
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

    const fn = (): void => {
      this.timedTargets.forEach((tgt: TimedTarget) => {
        tgt.timesCalled += 1;
        this.makeProgress(tgt);
      });
    };
    setInterval(fn, 1000);
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
    datasetName?: string,
    country?: string,
    language?: string
  ): Dataset {
    const totalRecords = parseInt(datasetId);
    return {
      status: DatasetStatus.IN_PROGRESS,
      'total-records': totalRecords,
      'processed-records': 0,
      'progress-by-step': Object.values(StepStatus).map((key: StepStatus) => {
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
      }
    };
  }

  /**
   * makeProgress
   *
   * Bumps fields in the TimedTarget.datasetInfo object making corresponding
   * depletions to fields in the TimedTarget.progressBurndown object
   *
   * @param {TimedTarget} timedTarget - the TimedTarget object to operate on
   **/
  makeProgress(timedTarget: TimedTarget): void {
    const info = timedTarget.datasetInfo;
    if (info['processed-records'] === info['total-records']) {
      info.status = DatasetStatus.COMPLETED;
      if (timedTarget.timesCalled >= 5) {
        info['portal-publish'] = 'http://this-collection/that-dataset/publish';
      }
      return;
    }
    info['processed-records'] += 1;
    const burndown = timedTarget.progressBurndown;
    const shiftField =
      burndown.warn > 0
        ? ProgressByStepStatus.WARN
        : burndown.fail > 0
        ? ProgressByStepStatus.FAIL
        : ProgressByStepStatus.SUCCESS;
    const pbsArray = info['progress-by-step'];
    const statusTargets = burndown.statusTargets
      ? burndown.statusTargets
      : Array.from(pbsArray.keys());

    pbsArray.forEach((pbs: ProgressByStep, key: number) => {
      if (shiftField !== ProgressByStepStatus.SUCCESS && statusTargets.indexOf(key) > -1) {
        pbs[shiftField] += 1;
        if (shiftField === ProgressByStepStatus.FAIL && burndown.error > 0) {
          const errorNum = info['processed-records'];
          const error = {
            type: `warnng (${errorNum})`,
            message: `the message will be long detailed technical stuff....`,
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
   * Retrieves or creates a TimedTarget object with the supplied id and writes
   * its datasetInfo data to the response.
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
      response.end(JSON.stringify(timedTarget.datasetInfo));
    } else {
      const datasetInfo = this.initialiseDataset(this.ensureNumeric(id[0]));
      if (id === '13') {
        datasetInfo['error-type'] = 'The processing did not complete';
      }
      this.addTimedTarget(id, datasetInfo);
      response.end(JSON.stringify(datasetInfo));
    }
  }

  /**
   * addTimedTarget
   *
   *  Derives progressBurndown data and adds it to a TimedTarget
   *
   * @param { string } id - object identity
   * @param { Dataset } datasetInfo - the timed target datasetInfo
   **/
  addTimedTarget(id: string, datasetInfo: Dataset): void {
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
        total: parseInt(paddedId[0]),
        warn: parseInt(paddedId[1]),
        fail: parseInt(paddedId[2]),
        error: parseInt(paddedId[3]),
        statusTargets: statusTargets
      },
      datasetInfo: datasetInfo,
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
    const severities = [
      ProblemPatternSeverity.ERROR,
      ProblemPatternSeverity.FATAL,
      ProblemPatternSeverity.NOTICE,
      ProblemPatternSeverity.WARNING
    ];
    const dimensions = [
      ProblemPatternQualityDimension.ACCURACY,
      ProblemPatternQualityDimension.AVAILABILITY,
      ProblemPatternQualityDimension.COMPLETENESS,
      ProblemPatternQualityDimension.CONCISENESS,
      ProblemPatternQualityDimension.COMPLIANCE,
      ProblemPatternQualityDimension.CONSISTENCY,
      ProblemPatternQualityDimension.TIMELINESS,
      ProblemPatternQualityDimension.LICENSING,
      ProblemPatternQualityDimension.INTERLINKING,
      ProblemPatternQualityDimension.UNDERSTANDABILITY,
      ProblemPatternQualityDimension.REPRESENTATIONAL
    ];

    const problemTitles = [
      'Very short description',
      'Very short title',
      'Extremely long description',
      'Extremely long title',
      'Extremely long values',
      'Missing description fields',
      'Missing title fields',
      'Equal(lower cased) title and description',
      'Equal(upper cased) title and description',
      'Equal title and description'
    ];

    const messageReportDescription = 'urbano dejanje 2015 the courtyard';
    const messageReports = [
      'description',
      'title',
      'A really, really, really, really, really, extremely long description...',
      'A really, really, really, really, really, extremely long title...',
      'A really, really, really, really, really, extremely long value',
      '',
      '',
      messageReportDescription,
      messageReportDescription.toUpperCase(),
      messageReportDescription.charAt(0).toUpperCase() + messageReportDescription.slice(1)
    ];

    return {
      problemPatternDescription: {
        problemPatternId: `P${patternId}` as ProblemPatternId,
        problemPatternSeverity: severities[patternId % severities.length],
        problemPatternQualityDimension: dimensions[patternId % dimensions.length],
        problemPatternTitle: problemTitles[patternId % problemTitles.length]
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: recordId ? decodeURIComponent(recordId) : '/X/generated-record-id',
          problemOccurrenceList: [
            {
              messageReport: messageReports[patternId % messageReports.length],
              affectedRecordIds: Object.keys(new Array(patternId % 5).fill(null)).map((i) => {
                return `/${datasetId}/${patternId + i}`;
              })
            }
          ]
        }
      ]
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

        const datasetInfo = this.initialiseDataset(
          `${this.newId}`,
          datasetName,
          getParam('country'),
          getParam('language')
        );

        this.addTimedTarget(`${this.newId}`, datasetInfo);

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
              executionStep: `step ${id}`,
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
