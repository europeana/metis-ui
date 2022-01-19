import { LicenseType, MediaDataItem, RecordReport, RecordType } from '../_models';

export const mockMediaResources: Array<MediaDataItem> = [
  {
    resourceUrl: 'https://text-resource-url.com',
    mediaType: 'text/text',
    elementLinkType: 'edm:isShownBy',
    imageResolution: '1 kilobytes',
    verticalResolution: '16 pixels',
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://3d-resource-url.com',
    mediaType: 'image/3d',
    elementLinkType: 'edm:isShownBy',
    imageResolution: '33.8 megapixel',
    verticalResolution: '128 pixels',
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://audio-resource-url.com',
    mediaType: 'audio/mp3',
    elementLinkType: 'edm:isShownBy',
    imageResolution: '28.3 megapixel',
    verticalResolution: '0 pixels',
    licenseType: LicenseType.OPEN
  },
  {
    resourceUrl: 'https://image-resource-url.com',
    mediaType: 'image/jpeg',
    elementLinkType: 'edm:isShownBy',
    imageResolution: '91.12 megapixel',
    verticalResolution: '480 pixels',
    licenseType: LicenseType.RESTRICTED
  },
  {
    resourceUrl: 'https://video-resource-url.com',
    mediaType: 'video/mpeg',
    elementLinkType: 'edm:isShownBy',
    imageResolution: '5 megapixel',
    verticalResolution: '320 pixels',
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
    recordType: RecordType.AUDIO,
    licenseType: LicenseType.OPEN,
    thumbnailAvailable: true,
    landingPageAvailable: true,
    embeddableMediaAvailable: true,
    mediaResourceTechnicalMetadataList: mockMediaResources,
    processingErrorsList: [
      {
        errorMessage: 'Error1',
        errorCode: 404
      },
      {
        errorMessage: 'Error2',
        errorCode: 500
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
