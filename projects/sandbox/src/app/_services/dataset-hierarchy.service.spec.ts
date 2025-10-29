import { TestBed } from '@angular/core/testing';
import { DatasetHierarchyService } from './dataset-hierarchy.service';

describe('dataset hierarchy service', () => {
  let service: DatasetHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(DatasetHierarchyService);
    service.keyConnections = 'test-dataset-hierarchies';
  });

  afterEach(() => {
    localStorage.removeItem(service.keyConnections);
  });

  it('should init', () => {
    expect(service).toBeTruthy();
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

    //console.log(JSON.stringify(hierarchy, null, 4));
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
