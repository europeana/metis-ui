import { mockMediaResources } from '../src/app/_mocked/mocked-record-report';
import { LicenseType, RecordReport, RecordType } from '../src/app/_models';

export class ReportGenerator {
  errorList = [
    {
      errorMessage: 'Null Pointer Exceception somewhere in the processing.',
      errorCode: 404
    },
    {
      errorMessage: 'Large error: very dangerous.',
      errorCode: 405
    },
    {
      errorMessage: 'Stacktrace.',
      errorCode: 406
    },
    {
      errorMessage: 'Nerdy stuff.',
      errorCode: 503
    },
    {
      errorMessage: 'Levis.',
      errorCode: 501
    },
    {
      errorMessage: 'Another Stacktrace',
      errorCode: 500
    }
  ];

  generateReport = (id: number): string => {
    let media = mockMediaResources;
    let errors = this.errorList;
    let errorMode = false;

    const ctVals = [0, 1, 2, 3, 4];
    const ctVal = ctVals[id % ctVals.length];

    const mdVals = ['A', 'B', 'C', 'D'];
    const mdVal = mdVals[id % mdVals.length];

    if (id >= 100) {
      media = media.concat(media);
    } else if (id % 2 === 0) {
      media = media.slice(0, 1);
      errors = errors.slice(0, 2);
    } else if (id % 13 === 0) {
      errorMode = true;
    }

    const realReport: RecordReport = {
      recordTierCalculationSummary: {
        europeanaRecordId: `${id}-eu`,
        providerRecordId: `${id}-provider`,
        contentTier: `${ctVal}`,
        metadataTier: mdVal,
        portalLink: 'https://portal.link',
        harvestedRecordLink: 'https://harvest-record/XXXDDDaaaaabbbbbccccc/record-url.link'
      },
      contentTierBreakdown: {
        recordType: RecordType.AUDIO,
        licenseType: LicenseType.OPEN,
        thumbnailAvailable: !errorMode,
        landingPageAvailable: !errorMode,
        embeddableMediaAvailable: !errorMode,
        mediaResourceTechnicalMetadataList: media,
        processingErrorsList: id === 0 ? undefined : errors
      },
      metadataTierBreakdown: {
        languageBreakdown: {
          potentialLanguageQualifiedElements: 42,
          actualLanguageQualifiedElements: 34,
          actualLanguageQualifiedElementsPercentage: 81,
          actualLanguageUnqualifiedElements: 8,
          actualLanguageUnqualifiedElementsList: [
            'dc:creator',
            'edm:currentLocation',
            'this',
            'that',
            'the',
            'other'
          ],
          metadataTier: mdVal
        },
        enablingElements: {
          distinctEnablingElements: 7,
          distinctEnablingElementsList: [
            'dc:creator',
            'edm:currentLocation',
            'this',
            'that',
            'the',
            'other'
          ],
          metadataGroups: 2,
          metadataGroupsList: ['Agent', 'Place', 'this', 'that', 'the', 'other'],
          metadataTier: mdVal
        },
        contextualClasses: {
          completeContextualResources: 5,
          distinctClassesOfCompleteContextualResources: 2,
          distinctClassesList: ['edm:TimeSpan', 'edm:Place', 'this', 'that', 'the', 'other'],
          metadataTier: mdVal
        }
      }
    };
    return JSON.stringify(realReport);
  };
}
