interface DropInModelItem {
  value: string;
  valueOverride?: string;
  tooltip?: string;
  customClass?: string;
}

export interface DropInModel {
  [id: string]: DropInModelItem;
}

export interface DropInConfItem {
  dropInField: string;
  dropInColName: string;
  dropInOpHighlight?: boolean;
  dropInOpSummaryInclude?: boolean;
  dropInOpNoWrap?: boolean;
}

export enum ViewMode {
  SUGGEST = 0,
  PINNED = 1,
  SILENT = 2
}

export interface RecentModel {
  id: string;
  name: string;
  date: string;
}
