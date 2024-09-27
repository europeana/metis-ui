import {
  ProblemPattern,
  ProblemPatternAnalysisStatus,
  ProblemPatternId,
  ProblemPatternQualityDimension,
  ProblemPatternsDataset,
  ProblemPatternSeverity
} from '../_models';

export const mockProblemPatternsDataset: ProblemPatternsDataset = {
  datasetId: '20',
  analysisStatus: ProblemPatternAnalysisStatus.FINALIZED,
  problemPatternList: [
    {
      problemPatternDescription: {
        problemPatternId: ProblemPatternId.P5,
        problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
        problemPatternSeverity: ProblemPatternSeverity.WARNING,
        problemPatternTitle: 'Very short description'
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
        problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
        problemPatternTitle: 'Extremely long values'
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: '/60/_urn_www_culture_si_images_pageid_15067',
          problemOccurrenceList: [
            {
              messageReport: 'urbanooooo dejanjeeeee 20155555 theeeee courtyarddddd',
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
        problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
        problemPatternTitle: 'Equal(lower cased) title and description'
      },
      recordOccurrences: 1,
      recordAnalysisList: [
        {
          recordId: '/60/_urn_www_culture_si_images_pageid_15067',
          problemOccurrenceList: [
            {
              messageReport: 'urbano dejanje 2015 the courtyard',
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
      problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
      problemPatternTitle: 'Equal(lower cased) title and description'
    },
    recordOccurrences: 1,
    recordAnalysisList: [
      {
        recordId: '/60/_urn_www_culture_si_images_pageid_15067',
        problemOccurrenceList: [
          {
            messageReport: 'urbano dejanje 2015 the courtyard',
            affectedRecordIds: []
          }
        ]
      }
    ]
  }
];
