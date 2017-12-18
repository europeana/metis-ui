import { Workflow } from '../_models';

export class Dataset {
  id: number;
  flag: boolean;
  organizationId: string;
  name: string;  
  workflow: Workflow;
  totalProcessed: number;
  totalDataset: number;
  publishedRecords: number;
  lastPublicationDate: Date;
  reportFile: string;
  startDate: Date;
  endDate: Date;
  country: string;
  provider: string;
  harvestprotocol: string;
}
