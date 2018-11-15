import { Country } from './country';
import { Language } from './language';

export interface Dataset {
  id: string;
  datasetId: string;
  datasetName: string;
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

  xsltId?: string;
}
