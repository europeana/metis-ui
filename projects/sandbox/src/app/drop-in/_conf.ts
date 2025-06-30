import { DropInConfItem } from './_model';

export const dropInConfDatasets: Array<DropInConfItem> = [
  {
    dropInField: 'id',
    dropInColName: 'Id'
  },
  {
    dropInField: 'status',
    dropInColName: 'Status',
    dropInOpNoWrap: true,
    dropInOpSummaryInclude: true
  },
  {
    dropInField: 'name',
    dropInColName: 'Name',
    dropInOpSummaryInclude: true,
    dropInOpHighlight: true
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
