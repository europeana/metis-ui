import { Injectable } from '@angular/core';

import { HierarchyData, LinkedDatasetInfo } from '../_models';

@Injectable({ providedIn: 'root' })
export class DatasetHierarchyService {
  key = 'linked-dataset-info';

  /** getHierarchyData
   * returns the locally-stored info or an empty array
   **/
  getHierarchyData(id: string): HierarchyData {
    const children = this.getChildrenForId(id).map((x) => x.id);
    const siblings = this.getSiblingsForId(id).map((x) => x.id);
    const parent = this.getParentForId(id);
    return {
      parent,
      children,
      siblings,
      hasContent: !!parent || !!children.length || !!siblings.length
    };
  }

  /** getLinkedDatasetInfo
   * returns the locally-stored info or an empty array
   **/
  getLinkedDatasetInfo(): Array<LinkedDatasetInfo> {
    return JSON.parse(localStorage.getItem(this.key) ?? '[]') as Array<LinkedDatasetInfo>;
  }

  /** addItem
   * updates model and writes to local storage
   **/
  addItem(id: string, parentId: string): void {
    let items = this.getLinkedDatasetInfo();

    const existing = items.find((item: LinkedDatasetInfo) => {
      return id === item.id;
    });

    const newItem = {
      id,
      parentId
    };

    if (existing) {
      // full reqrite of all data
      localStorage.removeItem(this.key);
      items = [newItem];
    } else {
      items.push(newItem);
    }
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  /** getChildrenForId
   * returns the info filtered on the parent id
   **/
  getChildrenForId(id: string): Array<LinkedDatasetInfo> {
    return this.getLinkedDatasetInfo().filter((item: LinkedDatasetInfo) => {
      return id === item.parentId;
    });
  }

  /** getChildrenForId
   * returns the parent id, and empty string or null
   **/
  getParentForId(id: string): string | undefined {
    const item = this.getLinkedDatasetInfo().find((item: LinkedDatasetInfo) => {
      return id === item.id;
    });
    if (item) {
      return item.parentId;
    }
    return undefined;
  }

  /** getSiblingsForId
   * returns ...
   **/
  getSiblingsForId(id: string): Array<LinkedDatasetInfo> {
    const parentId = this.getParentForId(id);
    if (parentId) {
      return this.getChildrenForId(parentId).filter((item: LinkedDatasetInfo) => {
        return id !== item.id;
      });
    }
    return [];
  }
}
