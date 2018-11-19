// Java name: DatasetExecutionInformation

export interface HarvestData {
  lastPreviewDate: string;
  lastPreviewRecords: number;
  lastPreviewRecordsReadyForViewing: boolean;

  firstPublishedDate: string;
  lastPublishedDate: string;
  lastPublishedRecords: number;
  lastPublishedRecordsReadyForViewing: boolean;

  lastHarvestedDate: string;
  lastHarvestedRecords: number;
}
