export type MetadataTierValue = 'A' | 'B' | 'C' | 'D';
export type ContentTierValue = 0 | 1 | 2 | 3 | 4;
export type TierGridValue = ContentTierValue | MetadataTierValue | string | undefined;
export type TierDimension =
  | 'content-tier'
  | 'license'
  | 'metadata-tier'
  | 'metadata-tier-language'
  | 'metadata-tier-enabling-elements'
  | 'metadata-tier-contextual-classes'
  | 'record-id';

export enum DisplayedSubsection {
  PROGRESS = 0,
  TIERS
}

export interface DatasetTierSummaryBase {
  license: string;
  'content-tier': ContentTierValue;
  'metadata-tier': MetadataTierValue;
  'metadata-tier-language': MetadataTierValue;
  'metadata-tier-enabling-elements': MetadataTierValue;
  'metadata-tier-contextual-classes': MetadataTierValue;
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

export interface PagerInfo {
  currentPage: number;
  pageCount: number;
  pageRows: Array<DatasetTierSummaryRecord>;
}
