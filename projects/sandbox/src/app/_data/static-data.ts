import { DropInConfItem, ProblemPatternQualityDimension, ProblemPatternSeverity } from '../_models';

export const DATE_CONCISE_FMT = 'dd MMM (hh:mm a)';
export const DATE_VERBOSE_FMT = 'dd/MM/yyyy - hh:mm a';

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
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.CONCISENESS,
    problemPatternTitle: 'Near-identical title and description fields'
  },
  P5: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Unrecognizable title'
  },
  P6: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Non-meaningful title'
  },
  P7: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.COMPLETENESS,
    problemPatternTitle: 'Missing (or blank) description fields'
  },
  P9: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Very short description'
  },
  P12: {
    problemPatternSeverity: ProblemPatternSeverity.WARNING,
    problemPatternQualityDimension: ProblemPatternQualityDimension.ACCURACY,
    problemPatternTitle: 'Extremely long values'
  }
};

// Configuration of the dataset drop-in component.
// - temporarily disabled "status" entry:
/*
{
  dropInField: 'status', // NOSONAR
  dropInColName: 'Status', // NOSONAR
  dropInOpSummaryInclude: true // NOSONAR
}
*/
export const dropInConfDatasets: Array<DropInConfItem> = [
  {
    dropInField: 'id',
    dropInColName: 'Id',
    dropInNumeric: true
  },
  {
    dropInField: 'name',
    dropInColName: 'Name',
    dropInOpSummaryInclude: true,
    dropInOpHighlight: true,
    dropInEllipsis: true
  },
  {
    dropInField: 'harvest-protocol',
    dropInColName: 'Harvest'
  },
  {
    dropInField: 'about',
    dropInColName: 'About'
  },
  {
    dropInField: 'date',
    dropInColName: 'Date',
    dropInOpSummaryInclude: true
  }
];
