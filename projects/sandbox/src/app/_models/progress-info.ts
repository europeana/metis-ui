export enum StepStatus {
  'HARVEST_HTTP' = 'HARVEST_HTTP',
  'HARVEST_OAI_PMH' = 'HARVEST_OAI_PMH',
  'HARVEST_ZIP' = 'HARVEST_ZIP',
  'TRANSFORM_TO_EDM_EXTERNAL' = 'TRANSFORM_TO_EDM_EXTERNAL',
  'VALIDATE_EXTERNAL' = 'VALIDATE_EXTERNAL',
  'TRANSFORM' = 'TRANSFORM',
  'VALIDATE_INTERNAL' = 'VALIDATE_INTERNAL',
  'NORMALIZE' = 'NORMALIZE',
  'ENRICH' = 'ENRICH',
  'MEDIA_PROCESS' = 'MEDIA_PROCESS',
  'PUBLISH' = 'PUBLISH'
}

export const StepStatusClass: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'harvest'],
  [StepStatus.HARVEST_OAI_PMH, 'harvest'],
  [StepStatus.HARVEST_ZIP, 'harvest'],
  [StepStatus.ENRICH, 'enrichment'],
  [StepStatus.NORMALIZE, 'normalization'],
  [StepStatus.MEDIA_PROCESS, 'media_process'],
  [StepStatus.TRANSFORM, 'transformation'],
  [StepStatus.TRANSFORM_TO_EDM_EXTERNAL, 'transformation_edm'],
  [StepStatus.VALIDATE_EXTERNAL, 'validation_external'],
  [StepStatus.VALIDATE_INTERNAL, 'validation_internal'],
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
  'COMPLETED' = 'COMPLETED',
  'FAILED' = 'FAILED'
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

export interface TierInfo {
  samples: Array<string>;
  total: number;
}

export interface DatasetLog {
  type: string;
  message: string;
}

export interface Dataset {
  status: DatasetStatus;
  'records-published-successfully': boolean;
  'processed-records': number;
  'progress-by-step': Array<ProgressByStep>;
  'total-records': number;
  'portal-publish'?: string;
  'dataset-info': DatasetInfo;
  'dataset-logs': Array<DatasetLog>;
  'error-type'?: string;
  'tier-zero-info'?: {
    'content-tier'?: TierInfo;
    'metadata-tier'?: TierInfo;
  };
}
