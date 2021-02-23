import { Validators } from '@angular/forms';

export enum WizardFieldType {
  select = 'select',
  text = 'text',
  progress = 'progress',
  harvest = 'harvest'
}

export interface WizardField {
  name: string;
  label?: string;
  type?: WizardFieldType;
  validators?: Array<Validators>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Array<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: string;
}

export interface WizardStep {
  title: string;
  instruction: string;
  fields?: Array<WizardField>;
}
