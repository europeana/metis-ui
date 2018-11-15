import { PluginMetadata } from './plugin-metadata';

export interface ExecutionProgress {
  expectedRecords: number;
  processedRecords: number;
  progressPercentage: number;
  errors: number;
  status: string; // TODO: make enum
}

export interface PluginExecution {
  pluginType: string;
  id: string;
  pluginStatus: string; // TODO: make enum
  startedDate: string;
  updatedDate: string;
  finishedDate?: string;
  externalTaskId: string;
  executionProgress: ExecutionProgress;
  pluginMetadata: PluginMetadata;
  topologyName: string;
}

export interface WorkflowExecution {
  id: string;
  datasetId: string;
  workflowStatus: string; // TODO: make enum
  cancelling?: boolean;
  createdDate: string;
  startedDate: string;
  updatedDate: string;
  finishedDate?: string;
  metisPlugins: PluginExecution[];
}
