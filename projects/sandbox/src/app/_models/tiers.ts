export type MetadataTierValue = 'A' | 'B' | 'C' | 'D';
export type ContentTierValue = 0 | 1 | 2 | 3 | 4;
export type TierGridValue = ContentTierValue | MetadataTierValue | string | undefined;
export type TierDimension =
  | 'content-tier'
  | 'license'
  | 'metadata-tier-average'
  | 'metadata-tier-language'
  | 'metadata-tier-elements'
  | 'metadata-tier-classes'
  | 'record-id';

export enum DisplayedSubsection {
  PROGRESS = 0,
  TIERS
}

export interface DatasetTierSummaryBase {
  license: string;
  'content-tier': ContentTierValue;
  'metadata-tier-average': MetadataTierValue;
  'metadata-tier-language': MetadataTierValue;
  'metadata-tier-elements': MetadataTierValue;
  'metadata-tier-classes': MetadataTierValue;
}

export interface DatasetTierSummaryRecord extends DatasetTierSummaryBase {
  'record-id': string;
}

export interface DatasetTierSummary extends DatasetTierSummaryBase {
  records: Array<DatasetTierSummaryRecord>;
}

export enum SortDirection {
  DESC = -1,
  NONE = 0,
  ASC = 1
}
