import { DropInConfItem } from '../_models';

export const DATE_CONCISE_FMT = 'dd MMM (hh:mm a)';
export const DATE_VERBOSE_FMT = 'dd/MM/yyyy - hh:mm a';

export const dropInConfRecords: Array<DropInConfItem> = [
  {
    dropInField: 'id',
    dropInColName: 'Id'
  }
];

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
