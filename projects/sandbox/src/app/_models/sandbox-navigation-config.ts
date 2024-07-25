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

export enum SandboxPageType {
  HOME = 'HOME',
  UPLOAD = 'UPLOAD',
  PROGRESS_TRACK = 'PROGRESS_TRACK',
  REPORT = 'REPORT',
  PROBLEMS_DATASET = 'PROBLEMS_DATASET',
  PROBLEMS_RECORD = 'PROBLEMS_RECORD',
  PRIVACY_STATEMENT = 'PRIVACY_STATEMENT',
  COOKIE_POLICY = 'COOKIE_POLICY'
}

export interface SandboxPage {
  error?: HttpErrorResponse;
  isBusy?: boolean;
  isHidden: boolean;
  lastLoadedIdDataset?: string;
  lastLoadedIdRecord?: string;
  stepTitle: string;
  stepType: SandboxPageType;
}
