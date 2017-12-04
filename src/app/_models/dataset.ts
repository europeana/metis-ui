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
  startDate: Date;
  endDate: Date;
}
