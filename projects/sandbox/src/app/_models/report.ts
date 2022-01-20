export enum LicenseType {
  'OPEN' = 'open',
  'RESTRICTED' = 'restricted'
}

export enum RecordType {
  '3D' = '3d',
  'AUDIO' = 'audio',
  'IMAGE' = 'image',
  'TEXT' = 'text',
  'VIDEO' = 'video',
  'OTHER' = 'other'
}

interface RecordTierCalculationSummary {
  europeanaRecordId: string;
  providerRecordId: string;
  contentTier: string;
  metadataTier: string;
  portalRecordLink: string;
  harvestedRecordLink: string;
}

export interface MediaDataItem {
  resourceUrl: string;
  mediaType: string;
  elementLinkType: string;
  imageResolution: string;
  verticalResolution: string;
  licenseType: LicenseType;

  cssClass?: string;
}

interface ProcessingError {
  errorMessage: string;
  errorCode: number;
}

interface ContentTierBreakdown {
  recordType: RecordType;
  licenseType: LicenseType;
  thumbnailAvailable: boolean;
  landingPageAvailable: boolean;
  embeddableMediaAvailable: boolean;
  mediaResourceTechnicalMetadataList: Array<MediaDataItem>;
  processingErrorsList?: Array<ProcessingError>;
}

interface LanguageBreakdown {
  potentialLanguageQualifiedElements: number;
  actualLanguageQualifiedElements: number;
  actualLanguageQualifiedElementsPercentage: number;
  actualLanguageUnqualifiedElementsList: Array<string>;
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
