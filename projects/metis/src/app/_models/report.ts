import { PluginType, TopologyName } from './workflow-execution';

export interface ReportErrorDetails {
  identifier: string;
  additionalInfo: string;
}

// Java name: TaskErrorInfo

export interface ReportError {
  errorType: string;
  message: string;
  occurrences: number;
  errorDetails: ReportErrorDetails[];
}

// Java name: TaskErrorsInfo

export interface Report {
  id: string;
  errors: ReportError[];
}

export interface ReportRequest {
  topology?: TopologyName;
  pluginType?: PluginType;
  taskId?: string;
  message?: string;
  workflowExecutionId?: string;
}

// data-augmented object
export interface ReportRequestWithData extends ReportRequest {
  errors?: ReportError[];
}

export interface ReportAvailability {
  existsExternalTaskReport: boolean;
}
