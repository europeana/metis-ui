export interface filterExecutionOptionInput {
  id?: string;
  type: string;
  fnOnSet?(val: string): void;

  // function: onChange(val:string): void { "set the min or max" }
}

export interface filterExecutionOption {
  value: string;
  //input?: string;
  input?: filterExecutionOptionInput;
  group?: string;
}

export interface filterExecution {
  label: string;

  //multi: boolean;
  multi: number;

  name: string;
  options?: filterExecutionOption[];
}
