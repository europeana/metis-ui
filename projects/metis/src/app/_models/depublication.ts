import { Results } from '.';
import { RecordDepublicationInfo } from '.';

export enum SortDirection {
  UNSET = 'UNSET',
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface SortParameter {
  field: string;
  direction: SortDirection;
}

export interface RecordDepublicationInfoDeletable extends RecordDepublicationInfo {
  deletion?: boolean;
}

export interface DepublicationDeletionInfo {
  recordId: string;
  deletion: boolean;
}

export interface DepublicationReason {
  valueAsString: string;
  name: string;
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
