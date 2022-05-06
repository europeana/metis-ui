export enum ProblemPatternId {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P5 = 'P5',
  P6 = 'P6',
  P7 = 'P7',
  P9 = 'P9',
  P12 = 'P12'
}

export enum ProblemPatternSeverity {
  NOTICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export enum ProblemPatternQualityDimension {
  ACCURACY = 'ACCURACY',
  AVAILABILITY = 'AVAILABILITY',
  COMPLETENESS = 'COMPLETENESS',
  CONCISENESS = 'CONCISENESS',
  COMPLIANCE = 'COMPLIANCE',
  CONSISTENCY = 'CONSISTENCY',
  TIMELINESS = 'TIMELINESS',
  LICENSING = 'LICENSING',
  INTERLINKING = 'INTERLINKING',
  UNDERSTANDABILITY = 'UNDERSTANDABILITY',
  REPRESENTATIONAL = 'REPRESENTATIONAL'
}

export interface ProblemPatternDescription {
  problemPatternId: ProblemPatternId;
  problemPatternSeverity: ProblemPatternSeverity;
  problemPatternQualityDimension: ProblemPatternQualityDimension;
}

export interface ProblemOccurrence {
  messageReport: string;
  messageReportError?: string;
  messageReportCopy?: string;
  affectedRecordIds: Array<string>;
  affectedRecordIdsShowing?: boolean;
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
