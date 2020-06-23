// Java name: DatasetExecutionInformation

export enum CurrentDepublicationStatus {
  PUBLISHED = 'PUBLISHED',
  DEPUBLISHED = 'DEPUBLISHED'
}

export interface HarvestData {
  lastPreviewDate: string;
  lastPreviewRecords: number;
  lastPreviewRecordsReadyForViewing: boolean;
  firstPublishedDate: string;
  currentDepublicationStatus?: CurrentDepublicationStatus;
  lastDepublishedDate?: string;
  lastPublishedDate: string;
  lastDepublishedRecords?: number;
  lastPublishedRecords: number;
  lastPublishedRecordsReadyForViewing: boolean;

  lastHarvestedDate: string;
  lastHarvestedRecords: number;
}
