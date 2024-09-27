import { Subscription } from 'rxjs';
import { DatasetInfo, DatasetProgress, ProblemPatternsDataset } from '../../src/app/_models';

export interface GroupedDatasetData {
  'dataset-info': DatasetInfo;
  'dataset-progress': DatasetProgress;
  'dataset-problems'?: ProblemPatternsDataset;
}

export interface ProblemPatternsDatasetWithSubscriptionRef extends ProblemPatternsDataset {
  sub?: Subscription;
}

export interface ProgressBurndown {
  warn: number;
  fail: number;
  error: number;
  statusTargets?: Array<number>;
  timesCalled: number;
}

export enum ProgressByStepStatus {
  'FAIL' = 'fail',
  'WARN' = 'warn',
  'SUCCESS' = 'success'
}

export enum UrlManipulation {
  RESET_DATASET_PROBLEMS = 'SANDBOX_UI_RESET_DATASET_PROBLEMS'
}
