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

export interface RecordPublicationInfo {
  id: string;
  recordId: string;
  depublicationStatus: DepublicationStatus;
  depublicationDate?: string;
}

export interface SortHeaderConf {
  fieldName: string;
  translateKey: string;
  cssClass?: string;
}

export interface SortHeaderGroupConf {
  cssClass: string;
  items: Array<SortHeaderConf>;
}
