export enum DebiasSourceField {
  DCTERMS_ALTERNATIVE = 'DCTERMS_ALTERNATIVE',
  DC_DESCRIPTION = 'DC_DESCRIPTION',
  DC_TITLE = 'DC_TITLE',
  DC_SUBJECT_LITERAL = 'DC_SUBJECT_LITERAL',
  DC_SUBJECT_REFERENCE = 'DC_SUBJECT_REFERENCE',
  DC_TYPE_LITERAL = 'DC_TYPE_LITERAL',
  DC_TYPE_REFERENCE = 'DC_TYPE_REFERENCE'
}

export enum DebiasState {
  READY = 'READY',
  ERROR = 'ERROR',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

export interface DebiasInfo {
  'dataset-id': string;
  state: DebiasState;
  'creation-date': string;
}

export interface DebiasTag {
  start: number;
  end: number;
  length: number;
  uri: string;
}

export interface DebiasValue {
  language: string;
  literal: string;
  tags: Array<DebiasTag>;
}

export interface DebiasDetection {
  recordId: string;
  europeanaId: string;
  valueDetection: DebiasValue;
  sourceField: DebiasSourceField;
}

export interface DebiasReport extends DebiasInfo {
  detections: Array<DebiasDetection>;
}
