export type FilterParamType = 'WORKFLOW' | 'DATE' | 'STATUS' | 'USER';

export type FilterParamHash = { [key in FilterParamType]: FilterParamValue[] };

export interface FilterParamValue {
  group?: string;
  inputRef?: number;
  value: string;
}

export interface FilterExecutionConfOptionInput {
  id?: string;
  type: string;
  fnOnSet?(val: string): void;
}

export interface FilterExecutionConfOption {
  group?: string;
  input?: FilterExecutionConfOptionInput;
  value: string;
}

export interface FilterExecutionConf {
  label: string;
  multi?: boolean;
  name: FilterParamType;
  options?: FilterExecutionConfOption[];
}
