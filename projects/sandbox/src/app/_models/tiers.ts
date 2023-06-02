type MetadataTierValue = 'A' | 'B' | 'C' | 'D';
type ContentTierValue = 0 | 1 | 2 | 3 | 4;

export enum DisplayedSubsection {
  PROGRESS = 0,
  TIERS
}

export interface ContentSummaryRow extends DatasetContentInfo {
  'record-id': string;
}

export interface DatasetContentInfo {
  license: string;
  'content-tier': ContentTierValue;
  'metadata-tier-average': MetadataTierValue;
  'metadata-tier-language': MetadataTierValue;
  'metadata-tier-elements': MetadataTierValue;
  'metadata-tier-classes': MetadataTierValue;
}

export interface DatasetTierSummaryRecord extends DatasetContentInfo {
  'record-id': string;
}

export interface DatasetTierSummary extends DatasetContentInfo {
  records: Array<DatasetTierSummaryRecord>;
}
