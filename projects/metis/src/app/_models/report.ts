import { HttpErrorResponse } from '@angular/common/http';

import { PluginType, TopologyName } from './workflow-execution';

export interface ReportErrorDetails {
  identifier: string;
  additionalInfo: string;

  downloadError?: HttpErrorResponse;
  downloading?: boolean;
}

export interface ReportError {
  errorType: string;
  message: string;
  occurrences: number;
  errorDetails: ReportErrorDetails[];
}

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
