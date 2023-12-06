import { Dataset, DatasetInfo } from '../../src/app/_models';

export interface DatasetWithInfo extends Dataset {
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
  dataset: DatasetWithInfo;
  timesCalled: number;
  complete?: boolean;
}
