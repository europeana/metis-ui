// Java name: DatasetExecutionInformation

export interface HarvestData {
  lastPreviewDate: string;
  lastPreviewRecords: number;
  lastPreviewRecordsReadyForViewing: boolean;
  firstPublishedDate: string;
  isCurrentlyDepublished?: boolean;
  lastDepublishedDate?: string;
  lastPublishedDate: string;
  lastDepublishedRecords?: number;
  lastPublishedRecords: number;
  lastPublishedRecordsReadyForViewing: boolean;

  lastHarvestedDate: string;
  lastHarvestedRecords: number;
}
