import { ServerResponse } from 'http';
import {
  DebiasDetection,
  DebiasInfo,
  DebiasReport,
  DebiasState,
  DebiasDereferenceResult,
  DebiasDereferenceState
} from '../../src/app/_models';
import {
  derefUriSuffixErrorConnection,
  derefUriSuffixError,
  detections
} from './debias-report-detections';

const debiasReports: { [key: string]: DebiasReport } = {};

function addDefReport(datasetId: string): DebiasReport {
  const report = {
    'dataset-id': datasetId,
    state: DebiasState.READY,
    'creation-date': new Date().toISOString(),
    detections: []
  };
  debiasReports[datasetId] = report;
  return report;
}

export function runDebias(datasetId: string): boolean {
  let report = debiasReports[datasetId];
  if (!report) {
    report = addDefReport(datasetId);
  } else if (report.state !== DebiasState.READY) {
    return false;
  }
  report.state = DebiasState.PROCESSING;

  const reportDetections = detections.slice(0, parseInt(datasetId) % detections.length);

  const timerId = setInterval(() => {
    if (reportDetections.length === 0) {
      clearTimeout(timerId);
      report.state = DebiasState.COMPLETED;
    } else {
      debiasReports[datasetId].detections.push(reportDetections.pop() as DebiasDetection);
    }
  }, 2000);
  return true;
}

/**
 * getDebiasInfo
 *
 * @param { string } datasetId -
 **/
export function getDebiasInfo(datasetId: string): DebiasInfo {
  const res = { ...(debiasReports[datasetId] ?? addDefReport(datasetId)) };
  delete (res as { detections?: Array<DebiasDetection> }).detections;
  return res;
}

export function getDebiasReport(datasetId: string): DebiasReport | null {
  const res = debiasReports[datasetId];
  return res;
}

const dereferencedDebiasEntityError: DebiasDereferenceResult = {
  enrichmentBaseResultWrapperList: [
    {
      dereferenceStatus: DebiasDereferenceState.NO_VOCABULARY_MATCHING,
      enrichmentBaseList: []
    }
  ]
};

const dereferencedDebiasRecommendation: DebiasDereferenceResult = {
  enrichmentBaseResultWrapperList: [
    {
      dereferenceStatus: DebiasDereferenceState.SUCCESS,
      enrichmentBaseList: [
        {
          altLabelList: [
            { lang: 'nl', value: 'Aboriginal Australiërs' },
            { lang: 'nl', value: 'Aboriginal personen' }
          ],
          about: 'http://data.europa.eu/c4p/data/t_208_en',
          prefLabelList: [
            {
              lang: 'en',
              value: 'Tribe'
            }
          ],
          notes: [
            {
              lang: 'en',
              value:
                'Tropen Museum et al., eds., “Words Matter: An Unfinished Guide to Word Choices in the Cultural Sector,” 2018.'
            },
            {
              lang: 'en',
              value:
                'Andrei Nesterov, Laura Hollink, Marieke van Erp, and Jacco van Ossenbruggen. (2023).'
            }
          ],
          hiddenLabel: [
            {
              lang: 'en',
              value: 'Tribe'
            }
          ],
          definitions: [
            {
              lang: 'en',
              value:
                "The term 'tribe' is often associated with so-called non-complex societies with simple political organisation."
            }
          ],
          scopeNotes: [
            {
              lang: 'de',
              value: 'Nur mit Vorsicht zu nutzen.'
            },
            {
              lang: 'en',
              value: 'Use with caution.'
            },
            {
              lang: 'en',
              value:
                'When the people themselves find it an acceptable and respectful term for describing themselves.'
            },
            {
              lang: 'fr',
              value: 'A utiliser avec précaution.'
            },
            {
              lang: 'it',
              value: 'Usare con cautela.'
            },
            {
              lang: 'nl',
              value: 'Gebruik met voorzichtigheid.'
            }
          ]
        }
      ]
    }
  ]
};

export function getDebiasDereferenceResult(url: string): DebiasDereferenceResult {
  if (url.indexOf(derefUriSuffixError) > -1) {
    return dereferencedDebiasEntityError;
  } else {
    return dereferencedDebiasRecommendation;
  }
}

export function handleDebiasUrls(route: string, response: ServerResponse): boolean {
  const regDebiasInfo = /dataset\/([A-Za-z0-9_]+)\/debias\/info/.exec(route);

  if (regDebiasInfo && regDebiasInfo.length > 1) {
    response.end(JSON.stringify(getDebiasInfo(regDebiasInfo[1])));
    return true;
  }

  const regDebiasReport = /dataset\/([A-Za-z0-9_]+)\/debias\/report/.exec(route);

  if (regDebiasReport && regDebiasReport.length > 1) {
    response.end(JSON.stringify(getDebiasReport(regDebiasReport[1])));
    return true;
  }

  const regDebiasDereference = /dereference\?([A-Za-z0-9_]+)/.exec(route);

  if (regDebiasDereference && regDebiasDereference.length > 1) {
    if (route.indexOf(derefUriSuffixErrorConnection) > -1) {
      response.statusCode = 500;
      response.end();
    } else {
      setTimeout(() => {
        response.end(JSON.stringify(getDebiasDereferenceResult(route)));
      }, 500);
    }
    return true;
  }
  return false;
}
