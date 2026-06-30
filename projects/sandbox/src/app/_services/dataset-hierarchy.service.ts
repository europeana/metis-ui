import { Injectable } from '@angular/core';
import { HierarchyData, ItemDescriptor, LinkedDatasetInfo } from '../_models';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class DatasetHierarchyService {
  keyConnections = 'linked-dataset-info';
  keyDescriptions = 'linked-dataset-descriptions';

  enabled = apiSettings.enableLinkedDatasets;

  static suggestChildName(
    rootName: string,
    existingChildren: Array<ItemDescriptor>,
    tryIndex = 1
  ): string {
    let possibleName = '';
    const matches = /(.*)_(\d+$)/.exec(rootName); // NOSONAR
    if (matches && matches.length === 3) {
      tryIndex = Number.parseInt(matches[2]) + 1;
      rootName = matches[1];
    }

    possibleName = `${rootName}_${tryIndex}`;
    const exists = existingChildren.some((item: ItemDescriptor) => {
      return possibleName === item.name;
    });

    if (exists) {
      return DatasetHierarchyService.suggestChildName(rootName, existingChildren, tryIndex + 1);
    }
    return possibleName;
  }

  /** getLinkedDatasetInfo
   * @returns the locally-stored link info or an empty array
   **/
  getLinkedDatasetInfo(): Array<LinkedDatasetInfo> {
    return JSON.parse(localStorage.getItem(this.keyConnections) ?? '[]') as Array<
      LinkedDatasetInfo
    >;
  }

  /** getDescriptions
   * @returns the locally-stored descriptions or an empty map
   **/
  getDescriptions(): { [key: string]: string } {
    return JSON.parse(localStorage.getItem(this.keyDescriptions) ?? '{}') as {
      [key: string]: string;
    };
  }

  /** setName
   * Used to build data result.
   * FIXED: Creates a shallow copy instead of mutating the source reference to prevent Zoneless rendering loop crashes.
   * @param { LinkedDatasetInfo } item
   * @returns ItemDescriptor
   **/
  setName(item: LinkedDatasetInfo): ItemDescriptor {
    const descriptions = this.getDescriptions();
    return ({
      ...item,
      name: descriptions[item.id] ?? ''
    } as unknown) as ItemDescriptor;
  }

  /** getHierarchyData
   * returns the locally-stored info or an empty array
   * FIXED: Added optional chaining to prevent uncaught TypeErrors if item is undefined.
   * @param { string } id
   * @returns HierarchyData
   **/
  getHierarchyData(id: string): HierarchyData {
    if (!this.enabled) {
      return {
        parent: undefined,
        children: [],
        siblings: [],
        hasContent: false
      };
    }

    const filterChildren = (
      items: Array<LinkedDatasetInfo>,
      parentId: string
    ): Array<LinkedDatasetInfo> => {
      return items.filter((item: LinkedDatasetInfo) => {
        return parentId === item.parentId;
      });
    };

    const all = this.getLinkedDatasetInfo();

    const item = all.find((item: LinkedDatasetInfo) => {
      return id === item.id;
    });

    const children = filterChildren(all, id);

    // FIXED: Protects against undefined parent mapping lookups
    const parent = item?.parentId
      ? this.setName({ id: item.parentId } as LinkedDatasetInfo)
      : undefined;

    const siblings = parent
      ? filterChildren(all, parent.id).filter((item: LinkedDatasetInfo) => {
          return id !== item.id;
        })
      : [];

    return {
      parent,
      children: children.map((x) => this.setName(x)),
      siblings: siblings.map((x) => this.setName(x)),
      hasContent: !!parent || !!children.length || !!siblings.length
    };
  }

  /** addDescription
   * updates descriptions model and writes to local storage
   * @param { string } id
   * @param { string } description
   * @returns true if the name already exists
   **/
  addDescription(id: string, description: string): boolean {
    let res = false;
    let descriptions = this.getDescriptions();
    const existing = descriptions[id];

    if (existing) {
      console.log('duplicate hierarchy description (' + id + ': ' + existing + ')');
      descriptions = {};
      res = true;
    }
    descriptions[id] = description;
    localStorage.setItem(this.keyDescriptions, JSON.stringify(descriptions));
    return res;
  }

  /** addItem
   * updates connections model and writes to local storage
   * @param { string } id
   * @param { string } parentId
   * @param { string } name
   * @returns true if the name already exists
   **/
  addItem(id: string, parentId: string, name: string): void {
    if (!this.enabled) {
      console.log(JSON.stringify(apiSettings, null, 4));
      return;
    }

    let items = this.getLinkedDatasetInfo();

    const existingName = this.addDescription(id, name);

    const existing = items.some((item: LinkedDatasetInfo) => {
      return id === item.id;
    });

    const newItem = {
      id,
      parentId
    };

    if (existing || existingName) {
      // full rewrite of all data
      console.log(
        `duplicate${
          existingName ? ' (name)' : ''
        } adding (${id}, ${parentId}, ${name}) to the hierarchy - will clear`
      );
      localStorage.removeItem(this.keyConnections);
      items = [newItem];
    } else {
      items.push(newItem);
    }
    localStorage.setItem(this.keyConnections, JSON.stringify(items));
  }
}
