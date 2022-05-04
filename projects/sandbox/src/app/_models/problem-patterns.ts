export enum ProblemPatternSeverity {
  NOTICE = 'NOTICE',
  WARNING = 'WARNING'
}

export enum ProblemPatternQualityDimension {
  ACCURACY = 'ACCURACY',
  COMPLETENESS = 'COMPLETENESS',
  CONCISENESS = 'CONCISENESS'
}

export interface ProblemPatternDescription {
  problemPatternId: string;
  problemPatternSeverity: ProblemPatternSeverity;
  problemPatternQualityDimension: ProblemPatternQualityDimension;
}

export interface ProblemOccurrence {
  messageReport: string;
  messageReportError?: string;
  messageReportCopy?: string;
  affectedRecordIds: Array<string>;
}

export interface RecordAnalysis {
  recordId: string;
  problemOccurrenceList: Array<ProblemOccurrence>;
}

export interface ProblemPattern {
  problemPatternDescription: ProblemPatternDescription;
  recordOccurrences: number;
  recordAnalysisList: Array<RecordAnalysis>;
}

export interface ProblemPatternsDataset {
  datasetId: string;
  executionStep: string;
  executionTimestamp: string;
  problemPatternList: Array<ProblemPattern>;
}
