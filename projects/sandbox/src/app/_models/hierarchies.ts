export interface LinkedDatasetInfo {
  id: string;
  parentId: string;
}

export interface ItemDescriptor {
  id: string;
  name: string;
}

export interface HierarchyData {
  hasContent: boolean;
  parent?: ItemDescriptor;
  siblings: Array<ItemDescriptor>;
  children: Array<ItemDescriptor>;
}
