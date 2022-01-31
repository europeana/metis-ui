import { LicenseType, MediaDataItem, RecordMediaType, RecordReport } from '../_models';

export const mockMediaResources: Array<MediaDataItem> = [
  {
    resourceUrl: 'https://text-resource-url.com',
    mediaTier: 2,
    mediaType: RecordMediaType.TEXT,
    mimeType: 'mime 1',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 1,
    verticalResolution: 16,
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://3d-resource-url.com',
    mediaTier: 1,
    mediaType: RecordMediaType.THREE_D,
    mimeType: 'mime 2',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 33232128,
    verticalResolution: 128,
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://audio-resource-url.com',
    mediaTier: 4,
    mediaType: RecordMediaType.AUDIO,
    mimeType: 'mime 3',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 28323213,
    verticalResolution: 0,
    licenseType: LicenseType.OPEN
  },
  {
    resourceUrl: 'https://image-resource-url.com',
    mediaTier: 3,
    mediaType: RecordMediaType.IMAGE,
    mimeType: 'mime 4',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 91231231312,
    imageResolutionTier: 1,
    verticalResolution: 480,
    verticalResolutionTier: 2,
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://video-resource-url.com',
    mediaTier: 2,
    mediaType: RecordMediaType.VIDEO,
    mimeType: 'mime 5',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 52352343,
    verticalResolution: 320,
    licenseType: LicenseType.RESTRICTED
  }
];

export const mockRecordReport: RecordReport = {
  recordTierCalculationSummary: {
    europeanaRecordId: 'europeanaRecordId',
    providerRecordId: 'providerRecordId',
    contentTier: '4',
    metadataTier: 'C',
    portalRecordLink: 'https://example.com',
    harvestedRecordLink: 'https://example.com'
  },
  contentTierBreakdown: {
    recordType: RecordMediaType.AUDIO,
    licenseType: LicenseType.OPEN,
    thumbnailAvailable: true,
    landingPageAvailable: true,
    embeddableMediaAvailable: true,
    mediaResourceTechnicalMetadataList: mockMediaResources,
    processingErrorsList: [
      {
        errorMessage: 'Error1',
        stacktrace: 'And on and on it goes'
      },
      {
        errorMessage: 'Error2',
        stacktrace: 'And on and on it goes'
      }
    ]
  },
  metadataTierBreakdown: {
    languageBreakdown: {
      potentialLanguageQualifiedElements: 42,
      actualLanguageQualifiedElements: 34,
      actualLanguageQualifiedElementsPercentage: 81,
      actualLanguageUnqualifiedElementsList: ['dc:creator', 'edm:currentLocation'],
      metadataTier: 'C'
    },
    enablingElements: {
      distinctEnablingElementsList: ['dc:creator', 'edm:currentLocation'],
      metadataGroupsList: ['Agent, Place'],
      metadataTier: 'C'
    },
    contextualClasses: {
      completeContextualResources: 5,
      distinctClassesList: ['edm:TimeSpan', 'edm:Place'],
      metadataTier: 'C'
    }
  }
};
