export enum HarvestProtocol {
  'HARVEST_HTTP' = 'HARVEST_HTTP',
  'HARVEST_OAI' = 'HARVEST_OAI',
  'HARVEST_FILE' = 'HARVEST_FILE'
}

export enum HarvestType {
  FILE = 'FILE',
  HTTP = 'HTTP',
  OAI = 'OAI'
}

export enum StepStatus {
  'HARVEST_HTTP' = 'HARVEST_HTTP',
  'HARVEST_OAI' = 'HARVEST_OAI',
  'HARVEST_FILE' = 'HARVEST_FILE',
  'TRANSFORM_EXTERNAL' = 'TRANSFORM_EXTERNAL',
  'VALIDATE_EXTERNAL' = 'VALIDATE_EXTERNAL',
  'TRANSFORM_INTERNAL' = 'TRANSFORM_INTERNAL',
  'VALIDATE_INTERNAL' = 'VALIDATE_INTERNAL',
  'NORMALIZE' = 'NORMALIZE',
  'ENRICH' = 'ENRICH',
  'MEDIA' = 'MEDIA',
  'INDEX_PREVIEW' = 'INDEX_PREVIEW'
}

export const StepStatusClass: ReadonlyMap<StepStatus, string> = new Map([
  [StepStatus.HARVEST_HTTP, 'harvest'],
  [StepStatus.HARVEST_OAI, 'harvest'],
  [StepStatus.HARVEST_FILE, 'harvest'],
  [StepStatus.ENRICH, 'enrichment'],
  [StepStatus.NORMALIZE, 'normalization'],
  [StepStatus.MEDIA, 'media_process'],
  [StepStatus.TRANSFORM_INTERNAL, 'transformation'],
  [StepStatus.TRANSFORM_EXTERNAL, 'transformation_edm'],
  [StepStatus.VALIDATE_EXTERNAL, 'validation_external'],
  [StepStatus.VALIDATE_INTERNAL, 'validation_internal'],
  [StepStatus.INDEX_PREVIEW, 'publish']
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

export interface HarvestingParameterInfo {
  'harvest-protocol': HarvestType;
  url?: string;
  'set-spec'?: string;
  'step-size'?: string;
  'metadata-format'?: string;
  'file-name'?: string;
  'file-type'?: string;
}

interface DatasetInfoBase {
  'creation-date': string;
  'created-by-id': string;
  'dataset-id': string;
  'dataset-name': string;
  country: string;
  language: string;
}

export interface DatasetInfo extends DatasetInfoBase {
  'harvesting-parameters': HarvestingParameterInfo;
  'transformed-to-edm-external'?: boolean;
}

export interface UserDatasetInfo extends DatasetInfoBase {
  'harvest-protocol': HarvestType;
  // temporarily disabled status
  /*
  status: DatasetStatus;
  'total-records': number;
  'processed-records': number;
  */
}

export interface TierInfo {
  samples: Array<string>;
  total: number;
}

export interface DatasetLog {
  type: string;
  message: string;
}

export interface DatasetProgress {
  status: DatasetStatus;
  'processed-records': number;
  'progress-by-step': Array<ProgressByStep>;
  'total-records': number;
  'portal-preview'?: string;
  'dataset-logs': Array<DatasetLog>;
  'error-type'?: string;
  'tier-zero-info'?: {
    'content-tier'?: TierInfo;
    'metadata-tier'?: TierInfo;
  };
  'record-limit-exceeded'?: boolean;
}
