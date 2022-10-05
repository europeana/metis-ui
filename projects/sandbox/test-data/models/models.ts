import { Dataset, DatasetInfo } from '../../src/app/_models';

export interface DatasetWithInfo extends Dataset {
  // TODO: we maintain composite object here.  This will no longer be an override
  // once dataset-info is moved out of Dataset(Progress) object!
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
  dataset: Dataset;
  timesCalled: number;
}
