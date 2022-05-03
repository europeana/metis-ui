import {
  ProblemPattern,
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
        problemPatternId: 'P0',
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
        problemPatternId: 'P0',
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
        problemPatternId: 'P0',
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
      problemPatternId: 'P0',
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
