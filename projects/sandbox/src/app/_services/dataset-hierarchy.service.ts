import { Injectable } from '@angular/core';
import { HierarchyData, ItemDescriptor, LinkedDatasetInfo } from '../_models';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class DatasetHierarchyService {
  keyConnections = 'linked-dataset-info';
  keyDescriptions = 'linked-dataset-descriptions';

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
   * @param { LinkedDatasetInfo } item
   * @param { string } name
   * Used to build data result.
   * Casts the type and adds a name to a LinkedDatasetInfo object
   * @returns ItemDescriptor
   **/
  setName(item: LinkedDatasetInfo): ItemDescriptor {
    const descriptions = this.getDescriptions();
    const res = (item as unknown) as ItemDescriptor;
    res.name = descriptions[item.id] ?? '';
    return res;
  }

  /** getHierarchyData
   * @param { string } id
   * returns the locally-stored info or an empty array
   **/
  getHierarchyData(id: string): HierarchyData {

    if(!apiSettings.enableLinkedDatasets){
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

    const parent = item ? this.setName({ id: item.parentId } as LinkedDatasetInfo) : undefined;

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
   * @param { string } id
   * @param { string } parentId
   * @param { string } name
   * @returns true if the name already exists
   *
   * updates connections model and writes to local storage
   **/
  addItem(id: string, parentId: string, name: string): void {

    if(!apiSettings.enableLinkedDatasets){
      return;
    }

    let items = this.getLinkedDatasetInfo();

    const existingName = this.addDescription(id, name);

    const existing = items.find((item: LinkedDatasetInfo) => {
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
