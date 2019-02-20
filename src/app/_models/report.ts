import { TopologyName } from './workflow-execution';

export interface ErrorDetails {
  identifier: string;
  additionalInfo: string;
}

// Java name: TaskErrorInfo

export interface ReportError {
  errorType: string;
  message: string;
  occurrences: number;
  errorDetails: ErrorDetails[];
}

// Java name: TaskErrorsInfo

export interface Report {
  id: number;
  errors: ReportError[];
}

export interface ReportRequest {
  taskId: string;
  topology: TopologyName;
}

export interface SimpleReportRequest {
  topology?: TopologyName;
  taskId?: string;
  message?: string;
}
