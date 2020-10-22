export interface DatasetSearchView {
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  lastExecutionDate?: string;
}

export enum PublicationFitness {
  FIT = 'FIT',
  PARTIALLY_FIT = 'PARTIALLY_FIT',
  UNFIT = 'UNFIT'
}
