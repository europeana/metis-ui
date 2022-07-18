export enum StepStatus {
  'HARVEST_HTTP' = 'HARVEST_HTTP',
  'HARVEST_OAI_PMH' = 'HARVEST_OAI_PMH',
  'HARVEST_ZIP' = 'HARVEST_ZIP',
  'VALIDATE_EXTERNAL' = 'VALIDATE_EXTERNAL',
  'TRANSFORM' = 'TRANSFORM',
  'TRANSFORM_EDM' = 'TRANSFORM_EDM',
  'VALIDATE_INTERNAL' = 'VALIDATE_INTERNAL',
  'NORMALISE' = 'NORMALISE',
  'ENRICH' = 'ENRICH',
  'PROCESS_MEDIA' = 'PROCESS_MEDIA',
  'PREVIEW' = 'PREVIEW',
  'PUBLISH' = 'PUBLISH'
}

export const StepStatusClass: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'harvest'],
  [StepStatus.HARVEST_OAI_PMH, 'harvest'],
  [StepStatus.HARVEST_ZIP, 'harvest'],
  [StepStatus.ENRICH, 'enrichment'],
  [StepStatus.NORMALISE, 'normalization'],
  [StepStatus.PROCESS_MEDIA, 'media_process'],
  [StepStatus.TRANSFORM, 'transformation'],
  [StepStatus.TRANSFORM_EDM, 'transformation-edm'],
  [StepStatus.VALIDATE_EXTERNAL, 'validation_external'],
  [StepStatus.VALIDATE_INTERNAL, 'validation_internal'],
  [StepStatus.PREVIEW, 'preview'],
  [StepStatus.PUBLISH, 'publish']
]);

/** Raw data **/

export interface ProgressByStep {
  fail: number;
  warn: number;
  success: number;
  step: StepStatus;
  total: number;
  errors?: Array<ProgressError>;
}

export interface ProgressError {
  type: string;
  message: string;
  records: Array<string>;
}

export enum DatasetStatus {
  'HARVESTING_IDENTIFIERS' = 'HARVESTING_IDENTIFIERS',
  'IN_PROGRESS' = 'IN_PROGRESS',
  'COMPLETED' = 'COMPLETED'
}

export interface DatasetInfo {
  'creation-date': string;
  'dataset-id': string;
  'dataset-name': string;
  country: string;
  language: string;
  'transformed-to-edm-external'?: boolean;
  'record-limit-exceeded'?: boolean;
}

export interface Dataset {
  status: DatasetStatus;
  'processed-records': number;
  'progress-by-step': Array<ProgressByStep>;
  'total-records': number;
  'portal-publish'?: string;
  'dataset-info': DatasetInfo;
  'error-type'?: string;
}
