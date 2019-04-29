export type FilterParamType = 'WORKFLOW' | 'DATE' | 'STATUS';

export type FilterParamHash = { [key in FilterParamType]: FilterParamValue[] };

export interface FilterParamValue {
  group?: string;
  inputRef?: number;
  value: string;
}

export interface FilterExecutionConfOptionInput {
  id?: string;
  type: string;
  cbFnOnClear?(el: HTMLElement): void;
  cbFnOnSet?(val: string, opElements?: HTMLElement[]): void;
}

export interface FilterExecutionConfOption {
  group?: string;
  input?: FilterExecutionConfOptionInput;
  value: string;
  label: string;
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
