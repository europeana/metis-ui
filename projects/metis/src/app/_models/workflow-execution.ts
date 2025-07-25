import { PluginMetadata } from './plugin-metadata';

export enum PluginType {
  HTTP_HARVEST = 'HTTP_HARVEST',
  OAIPMH_HARVEST = 'OAIPMH_HARVEST',
  VALIDATION_EXTERNAL = 'VALIDATION_EXTERNAL',
  TRANSFORMATION = 'TRANSFORMATION',
  VALIDATION_INTERNAL = 'VALIDATION_INTERNAL',
  NORMALIZATION = 'NORMALIZATION',
  ENRICHMENT = 'ENRICHMENT',
  MEDIA_PROCESS = 'MEDIA_PROCESS',
  PREVIEW = 'PREVIEW',
  PUBLISH = 'PUBLISH',
  DEPUBLISH = 'DEPUBLISH',
  LINK_CHECKING = 'LINK_CHECKING'
}

export enum TaskState {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CURRENTLY_PROCESSING = 'CURRENTLY_PROCESSING',
  DROPPED = 'DROPPED',
  PROCESSED = 'PROCESSED',
  REMOVING_FROM_SOLR_AND_MONGO = 'REMOVING_FROM_SOLR_AND_MONGO'
}

export interface ExecutionProgressBasic {
  deletedRecords?: number;
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
  IDENTIFYING_DELETED_RECORDS = 'IDENTIFYING_DELETED_RECORDS',
  PENDING = 'PENDING',
  REINDEX_TO_PREVIEW = 'REINDEX_TO_PREVIEW',
  REINDEX_TO_PUBLISH = 'REINDEX_TO_PUBLISH',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

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
  executionProgress?: ExecutionProgress;
  topologyName: TopologyName;
  canDisplayRawXml?: boolean;
  hasReport?: boolean;
  pluginMetadata?: PluginMetadata;
}

export interface PluginExecutionOverview extends PluginExecutionBasic {
  progress?: ExecutionProgressBasic;
  failMessage?: string;
}

export enum WorkflowStatus {
  INQUEUE = 'INQUEUE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface WorkflowExecutionHistory {
  workflowExecutionId: string;
  startedDate: string;
}

export interface WorkflowExecutionHistoryList {
  executions: Array<WorkflowExecutionHistory>;
}

export interface PreviewFilter {
  executionId?: string;
  pluginType?: PluginType;
}

export interface PreviewFilters {
  baseFilter: PreviewFilter;
  comparisonFilter?: PreviewFilter;
  baseStartedDate?: string;
  sampleRecordIds?: Array<string>;
  searchedRecordId?: string;
}

export interface PluginAvailability {
  pluginType: PluginType;
  canDisplayRawXml: boolean;
}

export interface PluginAvailabilityList {
  plugins: Array<PluginAvailability>;
}

export interface WorkflowExecution {
  id: string;
  datasetId: string;
  isIncremental: boolean;
  ecloudDatasetId?: string;
  workflowPriority?: number;
  workflowStatus: WorkflowStatus;
  cancelling?: boolean;
  cancelledBy?: string;
  cancelledByUserName?: string;
  cancelledByFirstName?: string;
  cancelledByLastName?: string;
  startedBy?: string;
  startedByUserName?: string;
  startedByFirstName?: string;
  startedByLastName?: string;
  createdDate: string;
  startedDate: string;
  updatedDate?: string;
  finishedDate?: string;
  metisPlugins: PluginExecution[];
  datasetName?: string;
  currentPlugin?: PluginExecution;
  currentPluginIndex?: number;
}

export interface DatasetOverviewExecution {
  finishedDate?: string;
  startedDate?: string;
  id: string;
  plugins: PluginExecutionOverview[];
}

export interface DatasetSummary {
  datasetId: string;
  datasetName: string;
}

export interface DatasetOverview {
  dataset: DatasetSummary;
  execution: DatasetOverviewExecution;
  executionProgress?: DatasetExecutionProgress;
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

export function executionsIncludeDeleted(pluginExecutions: Array<PluginExecution>): boolean {
  return !!pluginExecutions.find((pe: PluginExecution) => {
    const ep = pe.executionProgress;
    if (ep) {
      return typeof ep.deletedRecords !== 'undefined' && ep.deletedRecords > 0;
    }
    return false;
  });
}
