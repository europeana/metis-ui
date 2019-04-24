export type FilterParamType = 'WORKFLOW' | 'DATE' | 'STATUS' | 'USER';

export type FilterParamHash = { [key in FilterParamType]: FilterParamValue[] };

export interface FilterParamValue {
  group?: string;
  inputRef?: number;
  value: string;
}

export interface FilterExecutionOptionInput {
  id?: string;
  type: string;
  fnOnSet?(val: string): void;
}

export interface FilterExecutionOption {
  group?: string;
  input?: FilterExecutionOptionInput;
  value: string;
}

export interface FilterExecution {
  label: string;
  multi?: boolean;
  name: FilterParamType;
  options?: FilterExecutionOption[];
}
