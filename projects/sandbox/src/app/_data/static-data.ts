import { ProblemPatternQualityDimension, ProblemPatternSeverity } from '../_models';

export const problemPatternData = {
  P1: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
    problemPatternTitle: 'Systematic use of the same title'
  },
  P2: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
    problemPatternTitle: 'Equal title and description fields'
  },
  P3: {
    problemPatternSeverity: ProblemPatternSeverity.NOTICE,
    problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
    problemPatternTitle: 'Near-identical title and description fields'
  },
  P5: {
    problemPatternSeverity: ProblemPatternSeverity.NOTICE,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Unrecognizable title'
  },
  P6: {
    problemPatternSeverity: ProblemPatternSeverity.NOTICE,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Non-meaningful title'
  },
  P7: {
    problemPatternSeverity: ProblemPatternSeverity.NOTICE,
    problemPatternQualityDimension: ProblemPatternQualityDimension.COMPLETENESS,
    problemPatternTitle: 'Missing (or blank) description fields'
  },
  P9: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Very short description'
  },
  P12: {
    problemPatternSeverity: ProblemPatternSeverity.NOTICE,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Extremely long values'
  }
};
