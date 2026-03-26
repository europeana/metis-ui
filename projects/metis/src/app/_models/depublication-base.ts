export enum DepublicationStatus {
  PENDING = 'PENDING',
  DEPUBLISHED = 'DEPUBLISHED'
}

export interface RecordDepublicationInfo {
  recordId: string;
  depublicationStatus: DepublicationStatus;
  depublicationDate?: string;
  depublicationReason: string;
}
