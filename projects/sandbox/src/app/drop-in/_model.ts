interface DropInModelItem {
  value: string;
  valueOverride?: string;
  dropInClass?: string;
  tooltip?: string;
  summaryInclude?: boolean;
  nowrap?: boolean;
}

export interface DropInModel {
  id: DropInModelItem;
  name?: DropInModelItem;
  description?: DropInModelItem;
  date?: DropInModelItem;
}

export enum ViewMode {
  SUGGEST = 0,
  PINNED = 1,
  SILENT = 2
}
