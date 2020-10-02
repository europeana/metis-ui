// Java name: DatasetExecutionInformation

export enum DatasetDepublicationStatus {
  PUBLISHED = 'PUBLISHED',
  DEPUBLISHED = 'DEPUBLISHED'
}

export interface HarvestData {
  lastPreviewDate: string;
  lastPreviewRecords: number;
  lastPreviewRecordsReadyForViewing: boolean;
  firstPublishedDate: string;
  publicationStatus?: DatasetDepublicationStatus;
  lastDepublishedDate?: string;
  lastPublishedDate: string;
  lastDepublishedRecords?: number;
  lastPublishedRecords: number;
  lastPublishedRecordsReadyForViewing: boolean;

  lastHarvestedDate: string;
  lastHarvestedRecords: number;
}
