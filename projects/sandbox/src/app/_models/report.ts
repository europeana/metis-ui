export enum LicenseType {
  'CLOSED' = 'CLOSED',
  'OPEN' = 'OPEN',
  'RESTRICTED' = 'RESTRICTED'
}

export enum RecordMediaType {
  'THREE_D' = '3D',
  'AUDIO' = 'AUDIO',
  'IMAGE' = 'IMAGE',
  'TEXT' = 'TEXT',
  'VIDEO' = 'VIDEO',
  'OTHER' = 'OTHER'
}

interface RecordTierCalculationSummary {
  europeanaRecordId: string;
  providerRecordId: string;
  contentTier: string;
  metadataTier: string;
  portalRecordLink: string;
}

export interface MediaDataItem {
  resourceUrl: string;
  mediaTier?: number;
  mediaType: string;
  mimeType?: string;
  elementLinkTypes?: Array<string>;
  imageResolution?: number;
  imageResolutionTier?: number;
  verticalResolution?: number;
  verticalResolutionTier?: number;
  licenseType?: LicenseType;
  cssClass?: string;
}

interface ProcessingError {
  errorMessage: string;
  stacktrace: string;
}

interface ContentTierBreakdown {
  recordType: RecordMediaType;
  licenseType: LicenseType;
  thumbnailAvailable: boolean;
  landingPageAvailable: boolean;
  embeddableMediaAvailable: boolean;
  mediaResourceTechnicalMetadataList: Array<MediaDataItem>;
  processingErrorsList?: Array<ProcessingError>;
}

interface LanguageBreakdown {
  qualifiedElementsWithoutLanguageList: Array<string>;
  qualifiedElementsWithLanguagePercentage: number;
  qualifiedElementsWithLanguage: number;
  qualifiedElements: number;
  metadataTier: string;
}

interface EnablingElements {
  distinctEnablingElementsList: Array<string>;
  metadataGroupsList: Array<string>;
  metadataTier: string;
}

interface ContextualClasses {
  completeContextualResources: number;
  distinctClassesList: Array<string>;
  metadataTier: string;
}

interface MetadataTierBreakdown {
  languageBreakdown: LanguageBreakdown;
  enablingElements: EnablingElements;
  contextualClasses: ContextualClasses;
}

export interface RecordReport {
  recordTierCalculationSummary: RecordTierCalculationSummary;
  contentTierBreakdown: ContentTierBreakdown;
  metadataTierBreakdown: MetadataTierBreakdown;
}
