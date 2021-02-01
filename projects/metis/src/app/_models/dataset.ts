import { Country } from './country';
import { Language } from './language';
import { PublicationFitness } from './dataset-shared';

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

  publicationFitness?: PublicationFitness;
  xsltId?: string | null;
}
