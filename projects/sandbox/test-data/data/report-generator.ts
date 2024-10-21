import { LicenseType, MediaDataItem, RecordMediaType, RecordReport } from '../../src/app/_models';

const e2eHost = 'http://localhost:3000';

export class ReportGenerator {
  stacktrace = [
    'eu.europeana.metis.sandbox.common.exception.RecordValidationException:',
    'Record: [Missing record identifier for EDM record] Node: [null] Message:',
    '[java.net.MalformedURLException: no protocol: ]\n\t at',
    'eu.europeana.metis.sandbox.service.workflow.ExternalValidationServiceImpl',
    '.validate(ExternalValidationServiceImpl.java:43)\n\tat',
    'eu.europeana.metis.sandbox.consumer.workflow.CreatedConsumer',
    '.lambda$validateExternal$0(CreatedConsumer.java:32)\n\tat',
    'eu.europeana.metis.sandbox.consumer.workflow.StepConsumer.consume',
    '(StepConsumer.java:35)'
  ].join(' ');

  errorList = [
    {
      errorMessage: 'Null Pointer Exception somewhere in the processing.',
      stacktrace: this.stacktrace
    },
    {
      errorMessage: 'Large error: very dangerous.',
      stacktrace: this.stacktrace
    },
    {
      errorMessage: 'Message..',
      stacktrace: this.stacktrace
    },
    {
      errorMessage: 'Nerdy stuff.',
      stacktrace: this.stacktrace
    },
    {
      errorMessage: 'Levis.',
      stacktrace: this.stacktrace
    },
    {
      errorMessage: 'Another Stacktrace',
      stacktrace: this.stacktrace
    }
  ];

  generateMediaResources(num: number): Array<MediaDataItem> {
    return Array.from(Array(num).keys()).map((i: number) => {
      return this.generateMediaResource(i);
    });
  }

  generateMediaResource(num: number): MediaDataItem {
    const itemType = this.generateType(num);
    return {
      resourceUrl: `${e2eHost}/media/my-${itemType}-resource-url.com`,
      mediaTier: num % 4,
      mediaType: itemType,
      mimeType: `mime ${num % 5}`,
      elementLinkTypes: ['edm:isShownBy'],
      imageResolution: num * 123456789,
      imageResolutionTier: 1,
      verticalResolution: num * 76,
      verticalResolutionTier: num % 3,
      licenseType: this.generateLicenseType(num)
    };
  }

  generateLicenseType = (num: number): LicenseType => {
    const types = [LicenseType.OPEN, LicenseType.CLOSED, LicenseType.RESTRICTED];
    return types[num % types.length];
  };

  generateType = (num: number): RecordMediaType => {
    const types = [
      RecordMediaType.THREE_D,
      RecordMediaType.AUDIO,
      RecordMediaType.IMAGE,
      RecordMediaType.TEXT,
      RecordMediaType.VIDEO,
      RecordMediaType.OTHER
    ];
    return types[num % types.length];
  };

  generateReport = (id: string): string => {
    let idAsInt = parseInt(id);
    let idAsFloat = parseFloat(id);

    if (isNaN(idAsInt)) {
      idAsInt = id.length;
    }
    if (isNaN(idAsFloat)) {
      idAsFloat = id.length;
    }

    let media: Array<MediaDataItem> = [];
    let errors = this.errorList.slice();
    let errorMode = false;
    let listLimit = 9;

    if (id.indexOf('.') > 0) {
      // use the decimal part as the list limit
      listLimit = parseInt(`${(parseFloat(idAsFloat.toFixed(1)) % 1) * 10}`);
    }

    const ctVals = [0, 1, 2, 3, 4];
    const ctVal = ctVals[idAsInt % ctVals.length];

    const mdVals = ['A', 'B', 'C', 'D'];
    const mdVal = mdVals[idAsInt % mdVals.length];

    const recordType = this.generateType(idAsInt);

    if (idAsInt === 0) {
      media = [];
    } else if (idAsInt >= 100) {
      media = this.generateMediaResources(10);
    } else if (idAsInt % 2 === 0) {
      media = this.generateMediaResources(1);
      errors = errors.slice(0, 2);
    } else {
      media = this.generateMediaResources(5);
    }

    if (idAsInt === 13) {
      media.forEach((item: MediaDataItem) => {
        item.mediaType = '';
      });
      errorMode = true;
    }

    const realReport: RecordReport = {
      recordTierCalculationSummary: {
        europeanaRecordId: `${id}-eu`,
        providerRecordId: `${id}-provider`,
        contentTier: `${ctVal}`,
        metadataTier: mdVal,
        portalRecordLink: `${e2eHost}/portal.record.link`
      },
      contentTierBreakdown: {
        recordType: recordType,
        licenseType: LicenseType.OPEN,
        thumbnailAvailable: idAsInt % 4 === 0,
        landingPageAvailable: !errorMode,
        mediaResource3DAvailable: !errorMode && recordType === RecordMediaType.THREE_D,
        embeddableMediaAvailable: !errorMode,
        mediaResourceTechnicalMetadataList: media,
        processingErrorsList: idAsInt === 0 ? undefined : errors
      },
      metadataTierBreakdown: {
        languageBreakdown: {
          qualifiedElements: 42,
          qualifiedElementsWithLanguage: 34,
          qualifiedElementsWithLanguagePercentage: 81,
          qualifiedElementsWithoutLanguageList: ['this', 'that', 'the', 'other'].slice(
            0,
            listLimit
          ),
          metadataTier: mdVal
        },
        enablingElements: {
          distinctEnablingElementsList: [
            'dc:creator',
            'edm:currentLocation',
            'this',
            'that',
            'the',
            'other'
          ].slice(0, listLimit),
          metadataGroupsList: ['Agent', 'Place', 'this', 'that', 'the', 'other'].slice(
            0,
            listLimit
          ),
          metadataTier: mdVal
        },
        contextualClasses: {
          completeContextualResources: 5,
          distinctClassesList: ['edm:TimeSpan', 'edm:Place', 'this', 'that', 'the', 'other'].slice(
            0,
            listLimit
          ),
          metadataTier: mdVal
        }
      }
    };
    return JSON.stringify(realReport);
  };
}
