import { HttpErrorResponse } from '@angular/common/http';

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift';

export type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> = Pick<
  TObj,
  Exclude<keyof TObj, ArrayLengthMutationKeys>
> & {
  readonly length: L;
  [I: number]: T;
  [Symbol.iterator]: () => IterableIterator<T>;
};

export interface FieldOption {
  name: string;
  xmlValue: string;
}

export enum WizardStepType {
  UPLOAD = 'UPLOAD',
  PROGRESS_TRACK = 'PROGRESS_TRACK',
  REPORT = 'REPORT',
  PROBLEMS_DATASET = 'PROBLEMS_DATASET',
  PROBLEMS_RECORD = 'PROBLEMS_RECORD'
}

export interface WizardStep {
  stepType: WizardStepType;
  fields: Array<string>;
  isHidden: boolean;
  isBusy?: boolean;
  error?: HttpErrorResponse;
}
