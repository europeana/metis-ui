import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../../../tools/test-data-server/test-data-server';
import {
  DatasetInfo,
  DatasetInfoStatus,
  FieldOption,
  ProgressByStep,
  StepStatus,
  SubmissionResponseData
} from '../src/app/_models';
import { ProgressByStepStatus, TimedTarget } from './models/models';

new (class extends TestDataServer {
  serverName = 'sandbox';
  errorCodes: Array<string>;
  newId = 0;
  timedTargets: Map<string, TimedTarget> = new Map<string, TimedTarget>();

  /**
   * constructor
   *
   * generate the error codes
   * initialise the progress timer
   **/
  constructor() {
    super();

    const generateRange = (start: number, end: number): Array<string> => {
      return [...Array(1 + end - start).keys()].map((v: number) => {
        return `${start + v}`;
      });
    };

    this.errorCodes = generateRange(400, 418).concat(generateRange(500, 508));

    const fn = (): void => {
      this.timedTargets.forEach((tgt: TimedTarget) => {
        this.makeProgress(tgt);
      });
    };
    setInterval(fn, 1000);
  }

  /**
   * handle404
   *
   * Handles 404 errors by displaying a message
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
   * initialiseDatasetInfo
   *
   * Initialises and returns a new DatasetInfo object
   *
   * @param {number} totalRecords - the value for the result's 'total-records'
   * @returns {DatasetInfo}
   **/
  initialiseDatasetInfo(totalRecords: number): DatasetInfo {
    return {
      status: DatasetInfoStatus.IN_PROGRESS,
      'total-records': totalRecords,
      'processed-records': 0,
      'progress-by-step': Object.values(StepStatus).map((key: StepStatus) => {
        return this.initialiseProgressByStep(key, totalRecords);
      })
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
      info.status = DatasetInfoStatus.COMPLETED;
      info['portal-preview'] = 'this-collection/that-dataset/preview';
      info['portal-publish'] = 'this-collection/that-dataset/publish';
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
      const datasetInfo = this.initialiseDatasetInfo(parseInt(this.ensureNumeric(id[0])));
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
   * @param { DatasetInfo } datasetInfo - the timed target datasetInfo
   **/
  addTimedTarget(id: string, datasetInfo: DatasetInfo): void {
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
      datasetInfo: datasetInfo
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
    if (request.method === 'POST') {
      const regRes = route.match(/\/dataset\/(\S+)\//);
      if (regRes) {
        this.newId++;
        this.headerJSON(response);
        response.end(
          JSON.stringify({
            'dataset-id': this.newId,
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
        const regxDataset = route.match(/\/dataset\/([A-Za-z0-9_]+)$/);
        if (!regxDataset) {
          this.handle404(route, response);
        } else {
          const id = regxDataset[1];
          if (this.errorCodes.indexOf(id) > -1) {
            response.statusCode = parseInt(id);
            response.end();
          } else {
            this.handleId(response, id);
          }
        }
      }
    }
  }
})();
