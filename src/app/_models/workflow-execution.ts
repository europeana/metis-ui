import { PluginMetadata } from './plugin-metadata';

export enum TaskState {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CURRENTLY_PROCESSING = 'CURRENTLY_PROCESSING',
  DROPPED = 'DROPPED',
  PROCESSED = 'PROCESSED',
  REMOVING_FROM_SOLR_AND_MONGO = 'REMOVING_FROM_SOLR_AND_MONGO',
}

export interface ExecutionProgressBasic {
  expectedRecords: number;
  processedRecords: number;
  progressPercentage: number;
  errors: number;
}

export interface ExecutionProgress extends ExecutionProgressBasic {
  status?: TaskState;
}

export interface DatasetExecutionProgress {
  stepsDone: number;
  stepsTotal: number;
  currentPluginProgress: ExecutionProgressBasic;
}

export enum PluginStatus {
  INQUEUE = 'INQUEUE',
  CLEANING = 'CLEANING',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

// Java name: AbstractMetisPlugin

export type PluginType =
  | 'VALIDATION_EXTERNAL'
  | 'VALIDATION_INTERNAL'
  | 'NORMALIZATION'
  | 'ENRICHMENT'
  | 'PREVIEW'
  | 'PUBLISH'
  | 'OAIPMH_HARVEST'
  | 'HTTP_HARVEST'
  | 'TRANSFORMATION'
  | 'MEDIA_PROCESS'
  | 'LINK_CHECKING';

// See Topology.java

export type TopologyName =
  | 'oai_harvest'
  | 'http_harvest'
  | 'validation'
  | 'xslt_transform'
  | 'normalization'
  | 'enrichment'
  | 'media_process'
  | 'link_checker'
  | 'indexer';

export interface PluginExecutionBasic {
  pluginType: PluginType;
  pluginStatus: PluginStatus;
  startedDate?: string;
  updatedDate?: string;
  finishedDate?: string;
  externalTaskId?: string;
  failMessage?: string;
}

export interface PluginExecution extends PluginExecutionBasic {
  id: string;
  executionProgress: ExecutionProgress;
  pluginMetadata: PluginMetadata;
  topologyName: TopologyName;

  hasReport?: boolean;
}

export interface PluginExecutionOverview extends PluginExecutionBasic {
  progress: ExecutionProgressBasic;
  failMessage?: string;
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
  cancelledBy?: string;
  createdDate: string;
  startedDate: string;
  updatedDate: string;
  finishedDate?: string;
  metisPlugins: PluginExecution[];

  datasetName?: string;
  currentPlugin?: PluginExecution;
  currentPluginIndex?: number;
}

export interface DatasetOverviewExecution {
  finishedDate?: string;
  startedDate?: string;
  plugins: PluginExecutionOverview[];
}

export interface DatasetSummary {
  datasetId: string;
  datasetName: string;
}

export interface DatasetOverview {
  dataset: DatasetSummary;
  execution: DatasetOverviewExecution;
  executionProgress: DatasetExecutionProgress;
}

export interface CancellationRequest {
  workflowExecutionId: string;
  datasetId: string;
  datasetName: string;
}

export function isPluginCompleted(plugin: PluginExecution): boolean {
  const { pluginStatus } = plugin;
  return (
    pluginStatus === PluginStatus.FINISHED ||
    pluginStatus === PluginStatus.FAILED ||
    pluginStatus === PluginStatus.CANCELLED
  );
}

export function isWorkflowCompleted(workflow: WorkflowExecution): boolean {
  const { workflowStatus } = workflow;
  return (
    workflowStatus === WorkflowStatus.FINISHED ||
    workflowStatus === WorkflowStatus.FAILED ||
    workflowStatus === WorkflowStatus.CANCELLED
  );
}

export function getCurrentPluginIndex(workflow: WorkflowExecution): number {
  let currentPlugin = 0;
  for (let i = 0; i < workflow.metisPlugins.length; i++) {
    currentPlugin = i;
    if (!isPluginCompleted(workflow.metisPlugins[i])) {
      break;
    }
  }
  return currentPlugin;
}

export function getCurrentPlugin(workflow: WorkflowExecution): PluginExecution {
  return workflow.metisPlugins[getCurrentPluginIndex(workflow)];
}
