export enum ProblemPatternAnalysisStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINALIZED = 'FINALIZED',
  ERROR = 'ERROR'
}

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

export interface ProblemPatternDescriptionBasic {
  problemPatternSeverity: ProblemPatternSeverity;
  problemPatternQualityDimension: ProblemPatternQualityDimension;
  problemPatternTitle: string;
}

export interface ProblemPatternDescription extends ProblemPatternDescriptionBasic {
  problemPatternId: ProblemPatternId;
}

export interface ProblemOccurrence {
  messageReport: string;
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

export interface ProblemPatternsRecord {
  datasetId: string;
  problemPatternList: Array<ProblemPattern>;
}

export interface ProblemPatternsDataset extends ProblemPatternsRecord {
  analysisStatus: ProblemPatternAnalysisStatus;
}
