import { HierarchyData, ItemDescriptor, LinkedDatasetInfo } from '../_models';

export class MockDatasetHierarchyService {
  static suggestChildName(_: string, __: Array<ItemDescriptor>, ___ = 1): string {
    return '';
  }

  getLinkedDatasetInfo(): Array<LinkedDatasetInfo> {
    return [];
  }

  getDescriptions(): { [key: string]: string } {
    return {} as { [key: string]: string };
  }

  setName(_: LinkedDatasetInfo): ItemDescriptor {
    return { id: '', name: '' };
  }

  getHierarchyData(_: string): HierarchyData {
    return {
      parent: undefined,
      children: [],
      siblings: [],
      hasContent: false
    };
  }

  addDescription(_: string, __: string): boolean {
    return false;
  }

  addItem(_: string, __: string, ___: string): void {
    // not implemented
  }
}
