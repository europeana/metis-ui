import { LicenseType, MediaDataItem, RecordMediaType, RecordReport } from '../_models';

export const mockProcessedRecordData = {
  europeanaRecordId: 'europeanaRecordId',
  portalRecordLink: 'https://example.com'
};

const e2eMediaHost = 'http://localhost:3000/media';

export const mockMediaResources: Array<MediaDataItem> = [
  {
    resourceUrl: `${e2eMediaHost}/text-resource-url.com`,
    mediaTier: 2,
    mediaType: RecordMediaType.TEXT,
    mimeType: 'mime 1',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 1,
    verticalResolution: 16,
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: `${e2eMediaHost}/3d-resource-url.com`,
    mediaTier: 1,
    mediaType: RecordMediaType.THREE_D,
    mimeType: 'mime 2',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 33232128,
    verticalResolution: 128,
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: `${e2eMediaHost}/audio-resource-url.com`,
    mediaTier: 4,
    mediaType: RecordMediaType.AUDIO,
    mimeType: 'mime 3',
    elementLinkTypes: ['edm:isShownBy'],
    imageResolution: 28323213,
    verticalResolution: 0,
    licenseType: LicenseType.OPEN
  },
  {
    resourceUrl: `${e2eMediaHost}/image-resource-url.com`,
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
    resourceUrl: `${e2eMediaHost}/video-resource-url.com`,
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
    europeanaRecordId: mockProcessedRecordData.europeanaRecordId,
    providerRecordId: 'providerRecordId',
    contentTier: '4',
    metadataTier: 'C',
    portalRecordLink: mockProcessedRecordData.portalRecordLink
  },
  contentTierBreakdown: {
    recordType: RecordMediaType.AUDIO,
    licenseType: LicenseType.OPEN,
    thumbnailAvailable: true,
    landingPageAvailable: true,
    embeddableMediaAvailable: true,
    mediaResource3DAvailable: false,
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
      qualifiedElements: 42,
      qualifiedElementsWithLanguage: 34,
      qualifiedElementsWithLanguagePercentage: 81,
      qualifiedElementsWithoutLanguageList: ['dc:creator', 'edm:currentLocation'],
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
