export enum SortDirection {
  UNSET = 'UNSET',
  ASC = 'ASC',
  DESC = 'DESC'
}

export class SortParameter {
  field: string;
  direction: SortDirection;
}

export enum PublicationStatus {
  PUBLISHED = 'PUBLISHED',
  DEPUBLISHED = 'DEPUBLISHED'
}

export interface RecordPublicationInfo {
  id: string;
  recordUrl: string;
  publicationStatus: PublicationStatus;
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
