import { Results } from '.';

export enum SortDirection {
  UNSET = 'UNSET',
  ASC = 'ASC',
  DESC = 'DESC'
}

export class SortParameter {
  field: string;
  direction: SortDirection;
}

export enum DepublicationStatus {
  PENDING = 'PENDING',
  DEPUBLISHED = 'DEPUBLISHED'
}

export interface RecordDepublicationInfo {
  recordId: string;
  depublicationStatus: DepublicationStatus;
  depublicationDate?: string;
}

export interface RecordDepublicationInfoDeletable extends RecordDepublicationInfo {
  deletion?: boolean;
}

export interface DepublicationDeletionInfo {
  recordId: string;
  deletion: boolean;
}

export interface SortHeaderConf {
  fieldName?: string;
  translateKey?: string;
  cssClass?: string;
}

export interface SortHeaderGroupConf {
  cssClass: string;
  items: Array<SortHeaderConf>;
}

export interface DatasetDepublicationInfo {
  depublicationRecordIds: Results<RecordDepublicationInfo>;
  depublicationTriggerable: boolean;
}
