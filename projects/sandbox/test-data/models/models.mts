import { Subscription } from 'rxjs';
import { DatasetInfo, DatasetProgress } from '../../src/app/_models';
import { ProblemPatternsDataset } from '../src-copy/problem-patterns.mjs';

export interface GroupedDatasetData {
  'dataset-info': DatasetInfo;
  'execution-progress-info': DatasetProgress;
  'dataset-problems'?: ProblemPatternsDataset;
}

export interface ProblemPatternsDatasetWithSubscriptionRef extends ProblemPatternsDataset {
  sub?: Subscription;
}

export interface ProgressBurndown {
  warn: number;
  fail: number;
  error: number;
  totalPossible: number;
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
