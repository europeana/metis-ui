import { Validators } from '@angular/forms';

export enum WizardFieldType {
  select = 'select',
  text = 'text',
  progress = 'progress',
  harvest = 'harvest'
}

interface FieldOption {
  code: string;
  name: string;
}

export interface WizardField {
  name: string;
  label?: string;
  type?: WizardFieldType;
  validators?: Array<Validators>;
  options?: Array<string> | Array<FieldOption>;
  defaultValue?: string;
}

export enum WizardStepType {
  SET_NAME = 'SET_NAME',
  SET_LANG_LOCATION = 'SET_LANG_LOCATION',
  PROTOCOL_SELECT = 'PROTOCOL_SELECT',
  PROGRESS_TRACK = 'PROGRESS_TRACK'
}

export interface WizardStep {
  stepType: WizardStepType;
  fields?: Array<WizardField>;
}
