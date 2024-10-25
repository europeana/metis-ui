import { DebiasDetection, DebiasInfo, DebiasReport, DebiasState } from '../../src/app/_models';
import { detections } from './debias-report-detections';

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
