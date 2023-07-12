export type MetadataTierValue = 'A' | 'B' | 'C' | 'D';
export type ContentTierValue = 0 | 1 | 2 | 3 | 4;
export type TierGridValue = ContentTierValue | MetadataTierValue | string | undefined;
export type TierDimension =
  | 'content_tier'
  | 'license'
  | 'metadata_tier'
  | 'metadata_tier_language'
  | 'metadata_tier_enabling_elements'
  | 'metadata_tier_contextual_classes'
  | 'europeana_id';

export enum DisplayedSubsection {
  PROGRESS = 0,
  TIERS
}

export interface DatasetTierSummaryBase {
  license: string;
  content_tier: ContentTierValue;
  metadata_tier: MetadataTierValue;
  metadata_tier_language: MetadataTierValue;
  metadata_tier_enabling_elements: MetadataTierValue;
  metadata_tier_contextual_classes: MetadataTierValue;
}

export interface DatasetTierSummaryRecord extends DatasetTierSummaryBase {
  europeana_id: string;
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
