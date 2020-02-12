import { Country } from './country';
import { Language } from './language';

export interface DatasetSearchView {
  datasetId: string;
  datasetName: string;
  provider: string;
  dataProvider: string;
  lastExecutionDate?: string;
}

export interface Dataset {
  id: string;
  datasetId: string;
  ecloudDatasetId: string;
  datasetName: string;
  datasetIdsToRedirectFrom?: Array<string>;
  organizationId: string;
  organizationName: string;
  provider?: string;
  intermediateProvider?: string;
  dataProvider?: string;
  createdByUserId: string;
  createdDate: string;
  updatedDate?: string;
  replacedBy?: string;
  replaces?: string;

  country: Country;
  language: Language;

  description?: string;
  notes?: string;
  unfitForPublication?: boolean;

  xsltId?: string | null;
}
