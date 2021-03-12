export enum StepStatus {
  'IMPORT' = 'import',
  'VALIDATE_EXTERNAL' = 'validate (edm external)',
  'TRANSFORM' = 'transform',
  'VALIDATE_INTERNAL' = 'validate (edm internal)',
  'NORMALISE' = 'normalise',
  'ENRICH' = 'enrich',
  'PROCESS_MEDIA' = 'process media',
  'PREVIEW' = 'preview',
  'PUBLISH' = 'publish'
}

export const StepStatusClass: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.IMPORT, 'harvest'],
  [StepStatus.ENRICH, 'enrichment'],
  [StepStatus.NORMALISE, 'normalization'],
  [StepStatus.PROCESS_MEDIA, 'media_process'],
  [StepStatus.TRANSFORM, 'transformation'],
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

export enum DatasetInfoStatus {
  'COMPLETED' = 'completed',
  'IN_PROGRESS' = 'in progress'
}

export interface DatasetInfo {
  status: DatasetInfoStatus;
  'processed-records': number;
  'progress-by-step': Array<ProgressByStep>;
  'total-records': number;
  'portal-preview'?: string;
  'portal-publish'?: string;
}
