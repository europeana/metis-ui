import {
  ProblemPattern,
  ProblemPatternId,
  ProblemPatternQualityDimension,
  ProblemPatternsDataset,
  ProblemPatternSeverity
} from '../_models';

export const mockProblemPatternsDataset: ProblemPatternsDataset = {
  datasetId: '20',
  executionStep: 'step',
  executionTimestamp: 'timestamp',
  problemPatternList: [
    {
      problemPatternDescription: {
        problemPatternId: ProblemPatternId.P5,
        problemPatternSeverity: ProblemPatternSeverity.WARNING,
        problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: '/60/_urn_www_culture_si_images_pageid_15067',
          problemOccurrenceList: [
            {
              messageReport:
                'Equal(lower cased) title and description: urbano dejanje 2015 the courtyard',
              affectedRecordIds: []
            }
          ]
        }
      ]
    },
    {
      problemPatternDescription: {
        problemPatternId: ProblemPatternId.P1,
        problemPatternSeverity: ProblemPatternSeverity.WARNING,
        problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: '/60/_urn_www_culture_si_images_pageid_15067',
          problemOccurrenceList: [
            {
              messageReport:
                'Equal(lower cased) title and description: urbano dejanje 2015 the courtyard',
              affectedRecordIds: []
            }
          ]
        }
      ]
    },
    {
      problemPatternDescription: {
        problemPatternId: ProblemPatternId.P2,
        problemPatternSeverity: ProblemPatternSeverity.WARNING,
        problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: '/60/_urn_www_culture_si_images_pageid_15067',
          problemOccurrenceList: [
            {
              messageReport:
                'Equal(lower cased) title and description: urbano dejanje 2015 the courtyard',
              affectedRecordIds: []
            }
          ]
        }
      ]
    }
  ]
};

export const mockProblemPatternsRecord: Array<ProblemPattern> = [
  {
    problemPatternDescription: {
      problemPatternId: ProblemPatternId.P3,
      problemPatternSeverity: ProblemPatternSeverity.WARNING,
      problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS
    },
    recordOccurrences: 1,
    recordAnalysisList: [
      {
        recordId: '/60/_urn_www_culture_si_images_pageid_15067',
        problemOccurrenceList: [
          {
            messageReport:
              'Equal(lower cased) title and description: urbano dejanje 2015 the courtyard',
            affectedRecordIds: []
          }
        ]
      }
    ]
  }
];
