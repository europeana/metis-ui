import { DatasetInfo } from '../../src/app/_models';

export interface ProgressBurndown {
  total: number;
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
  datasetInfo: DatasetInfo;
}
