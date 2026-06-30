import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DatasetHierarchyService } from './dataset-hierarchy.service';
import { ItemDescriptor } from '../_models';

describe('dataset hierarchy service', () => {
  let service: DatasetHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    service = TestBed.inject(DatasetHierarchyService);
    service.keyConnections = 'test-dataset-hierarchies';
    service.enabled = true;
  });

  afterEach(() => {
    localStorage.removeItem(service.keyConnections);
  });

  it('should init', () => {
    expect(service).toBeTruthy();
  });

  it('should add items', () => {
    let existingName = false;

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    const addDescriptionSpy = vi
      .spyOn(service, 'addDescription')
      .mockImplementation((_: string, __: string) => {
        return existingName;
      });

    service.enabled = false;
    service.addItem('new_id', 'parent_id', 'new_name');
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();

    service.enabled = true;
    service.addItem('new_id', 'parent_id', 'new_name');
    expect(setItemSpy).toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();

    service.addItem('new_id', 'parent_id', 'new_name');
    expect(setItemSpy).toHaveBeenCalledTimes(2);
    expect(removeItemSpy).not.toHaveBeenCalled();

    existingName = true;
    service.addItem('new_id', 'parent_id', 'new_name');
    expect(setItemSpy).toHaveBeenCalledTimes(3);
    expect(removeItemSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    addDescriptionSpy.mockRestore();
  });

  it('should suggest the child name', () => {
    const existing: Array<ItemDescriptor> = [];
    const add = (name: string): void => {
      existing.push({
        id: 'x' + name,
        name: name
      });
    };
    expect(DatasetHierarchyService.suggestChildName('root', existing)).toEqual('root_1');
    add('root_1');
    expect(DatasetHierarchyService.suggestChildName('root', existing)).toEqual('root_2');
    add('root_3');
    expect(DatasetHierarchyService.suggestChildName('root', existing)).toEqual('root_2');
    add('root_2');
    expect(DatasetHierarchyService.suggestChildName('root', existing)).toEqual('root_4');

    expect(DatasetHierarchyService.suggestChildName('myName', existing)).toEqual(`myName_1`);
    expect(DatasetHierarchyService.suggestChildName('myName_1', existing)).toEqual(`myName_2`);
    expect(DatasetHierarchyService.suggestChildName('myName_', existing)).toEqual(`myName__1`);
    expect(DatasetHierarchyService.suggestChildName('myName_100', existing)).toEqual(`myName_101`);
    expect(DatasetHierarchyService.suggestChildName('myName_100_xxx', existing)).toEqual(
      `myName_100_xxx_1`
    );
  });

  it('should get the info', () => {
    const res = service.getLinkedDatasetInfo();
    expect(res).toBeTruthy();
    expect(res.length).toBeFalsy();
  });

  it('should save the info', () => {
    service.addItem('one', 'original', '_');
    const res = service.getLinkedDatasetInfo();
    expect(res).toBeTruthy();
    expect(res.length).toBeTruthy();
  });

  it('should get the parent', () => {
    service.addItem('one', 'original', '_');
    service.addItem('two', 'one', '_');
    service.addItem('two_two', 'one', '_');
    service.addItem('three', 'two', '_');
    service.addItem('three_two', 'two', '_');
    service.addItem('three_three', 'two', '_');

    let hierarchy = service.getHierarchyData('original');

    expect(hierarchy.parent).toBeFalsy();
    expect(hierarchy.siblings.length).toBeFalsy();
    expect(hierarchy.children.length).toEqual(1);

    hierarchy = service.getHierarchyData('one');

    expect(hierarchy.parent).toBeTruthy();
    expect(hierarchy.siblings.length).toBeFalsy();
    expect(hierarchy.children.length).toEqual(2);

    hierarchy = service.getHierarchyData('two');

    expect(hierarchy.parent).toBeTruthy();
    expect(hierarchy.siblings.length).toEqual(1);
    expect(hierarchy.children.length).toEqual(3);

    expect(hierarchy.hasContent).toBeTruthy();

    service.enabled = false;
    hierarchy = service.getHierarchyData('original');

    expect(hierarchy.hasContent).toBeFalsy();
  });

  it('should handle duplicates', () => {
    service.addItem('one', 'original', '_');
    service.addItem('one', 'new_parent', '_');

    expect(service.getLinkedDatasetInfo().length).toEqual(1);

    service.addItem('two', 'one', '_');
    service.addItem('three', 'one', '_');
    service.addItem('four', 'one', '_');

    expect(service.getLinkedDatasetInfo().length).toEqual(4);

    service.addItem('four', 'one', '_');
    expect(service.getLinkedDatasetInfo().length).toEqual(1);
  });
});
