export type FilterParamType = 'pluginType' | 'DATE' | 'pluginStatus';

export type FilterParamHash = { [key in FilterParamType]: FilterParamValue[] };

export interface CanHaveError {
  hasError: boolean;
  setHasError(val: boolean): void;
}

export interface FilterParamValue {
  group?: string;
  inputRef?: number;
  name?: string;
  value: string;
}

export interface FilterExecutionConfOptionInput {
  id?: string;
  type: string;
  max?: string;
  min?: string;
  cbFnOnClear?(el: HTMLElement): void;
  cbFnOnSet?(cmp: CanHaveError, el: HTMLInputElement, opElements?: HTMLElement[]): void;
}

export interface FilterExecutionConfOption {
  group?: string;
  input?: FilterExecutionConfOptionInput;
  label: string;
  name?: string;
  value: string;
}

export interface FilterExecutionProvider {
  getInputGroupElements(group: string): HTMLElement[];
  restoreGroup(group: string, callerIndex: number): void;
}

export interface FilterExecutionConf {
  label: string;
  multi?: boolean;
  name: FilterParamType;
  options?: FilterExecutionConfOption[];
}
