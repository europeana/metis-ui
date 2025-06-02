export interface DropInModel {
  id: string;
  name?: string;
  description?: string;
  date?: string;
}

export enum ViewMode {
  SUGGEST = 0,
  PINNED = 1,
  SILENT = 2
}
