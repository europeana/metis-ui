export type filterParamType = 'workflow' | 'date' | 'status' | 'user';

export interface filterParamValue {
  group?: string;
  inputRef?: number;
  value: string;
}

export interface filterExecutionParamData {
  fnOnSet?(val: string): void;
  id?: string;
  type: string;
}

export interface filterExecutionOptionInput {
  fnOnSet?(val: string): void;
  id?: string;
  type: string;
}

export interface filterExecutionOption {
  group?: string;
  input?: filterExecutionOptionInput;
  value: string;
}

export interface filterExecution {
  label: string;
  multi?: boolean;
  name: filterParamType;
  options?: filterExecutionOption[];
}
