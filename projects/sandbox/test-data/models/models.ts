import { Dataset } from '../../src/app/_models';

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
