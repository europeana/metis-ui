interface DropInModelItem {
  value: string;
  valueOverride?: string;
  tooltip?: string;

  dropInOpClass?: string;
  dropInOpHighlight?: boolean;

  dropInOpSummaryInclude?: boolean;
  dropInOpNoWrap?: boolean;
}

export interface DropInModel {
  id: DropInModelItem;
  name?: DropInModelItem;
  about?: DropInModelItem;
  date?: DropInModelItem;
}

export enum ViewMode {
  SUGGEST = 0,
  PINNED = 1,
  SILENT = 2
}
