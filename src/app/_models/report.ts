// Java name: TaskErrorInfo

export interface ReportError {
  errorType: string;
  message: string;
  occurrences: number;
}

// Java name: TaskErrorsInfo

export interface Report {
  id: string;
  errors: ReportError[];
}
