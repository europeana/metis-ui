interface DropInModelItem {
  value: string;
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
