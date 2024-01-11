import { DatasetInfo, DatasetProgress } from '../../src/app/_models';

export interface ProgressWithInfo extends DatasetProgress {
  // We maintain composite object here.
  'dataset-info': DatasetInfo;
}

export interface ProgressBurndown {
  warn: number;
  fail: number;
  error: number;
  statusTargets?: Array<number>;
}

export enum ProgressByStepStatus {
  'FAIL' = 'fail',
  'WARN' = 'warn',
  'SUCCESS' = 'success'
}

export interface TimedTarget {
  progressBurndown: ProgressBurndown;
  dataset: ProgressWithInfo;
  timesCalled: number;
  complete?: boolean;
}
