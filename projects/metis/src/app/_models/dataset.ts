import { Country } from './country';
import { Language } from './language';
import { PublicationFitness } from './dataset-shared';

export interface Dataset {
  id: string;
  datasetId: string;
  ecloudDatasetId: string;
  datasetName: string;
  datasetIdsToRedirectFrom?: Array<string>;
  provider?: string;
  intermediateProvider?: string;
  dataProvider?: string;
  createdByUserId: string;
  createdByFirstName: string;
  createdByLastName: string;
  createdByUserName: string;
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
