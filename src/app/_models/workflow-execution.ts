import { PluginMetadata } from './plugin-metadata';

export enum TaskState {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CURRENTLY_PROCESSING = 'CURRENTLY_PROCESSING',
  DROPPED = 'DROPPED',
  PROCESSED = 'PROCESSED',
  REMOVING_FROM_SOLR_AND_MONGO = 'REMOVING_FROM_SOLR_AND_MONGO',
}

export interface ExecutionProgress {
  expectedRecords: number;
  processedRecords: number;
  progressPercentage: number;
  errors: number;
  status?: TaskState;
}

export enum PluginStatus {
  INQUEUE = 'INQUEUE',
  CLEANING = 'CLEANING',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

// Java name: AbstractMetisPlugin

export interface PluginExecution {
  pluginType: string;
  id: string;
  pluginStatus: PluginStatus;
  startedDate?: string;
  updatedDate?: string;
  finishedDate?: string;
  externalTaskId?: string;
  executionProgress: ExecutionProgress;
  pluginMetadata: PluginMetadata;
  topologyName: string;

  hasReport?: boolean;
}

export enum WorkflowStatus {
  INQUEUE = 'INQUEUE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface WorkflowExecution {
  id: string;
  datasetId: string;
  ecloudDatasetId?: string;
  workflowPriority?: number;
  workflowStatus: WorkflowStatus;
  cancelling?: boolean;
  createdDate: string;
  startedDate: string;
  updatedDate: string;
  finishedDate?: string;
  metisPlugins: PluginExecution[];

  datasetName?: string;
  currentPlugin?: number;
}
