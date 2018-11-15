export interface ReportError {
  errorType: string;
  message: string;
  occurrences: number;
  identifiers: string[];
}

export interface Report {
  id: string;
  errors: ReportError[];
}
