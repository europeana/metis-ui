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
  SET_NAME = 'SET_NAME',
  SET_LANG_LOCATION = 'SET_LANG_LOCATION',
  PROTOCOL_SELECT = 'PROTOCOL_SELECT',
  PROGRESS_TRACK = 'PROGRESS_TRACK'
}

export interface WizardStep {
  stepType: WizardStepType;
  fields: Array<string>;
}
