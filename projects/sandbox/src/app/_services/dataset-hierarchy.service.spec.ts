import { TestBed } from '@angular/core/testing';
import { DatasetHierarchyService } from './dataset-hierarchy.service';

describe('dataset hierarchy service', () => {
  let service: DatasetHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({}).compileComponents();
    service = TestBed.inject(DatasetHierarchyService);
    service.key = 'test-dataset-hierarchies';
  });

  afterEach(() => {
    localStorage.removeItem(service.key);
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
    service.addItem('one', 'original');
    const res = service.getLinkedDatasetInfo();
    expect(res).toBeTruthy();
    expect(res.length).toBeTruthy();
  });

  it('should get the parent', () => {
    service.addItem('one', 'original');
    service.addItem('two', 'one');
    service.addItem('two_two', 'one');
    service.addItem('three', 'two');
    service.addItem('three_two', 'two');
    service.addItem('three_three', 'two');

    expect(service.getParentForId('original')).toBeFalsy();
    expect(service.getParentForId('one')).toEqual('original');

    expect(service.getParentForId('two')).toEqual('one');
    expect(service.getParentForId('two_two')).toEqual('one');

    expect(service.getParentForId('three')).toEqual('two');
    expect(service.getParentForId('three_two')).toEqual('two');
    expect(service.getParentForId('three_three')).toEqual('two');
  });

  it('should get the children', () => {
    service.addItem('one', 'original');
    service.addItem('two', 'one');

    expect(service.getLinkedDatasetInfo().length).toEqual(2);
    expect(service.getChildrenForId('one').length).toEqual(1);
    expect(service.getChildrenForId('two').length).toEqual(0);

    service.addItem('two_two', 'one');
    expect(service.getChildrenForId('one').length).toEqual(2);
  });

  it('should get the siblings', () => {
    service.addItem('one', 'original');
    service.addItem('two', 'one');
    service.addItem('two_two', 'one');
    service.addItem('three', 'two');
    service.addItem('three_two', 'two');
    service.addItem('three_three', 'two');

    expect(service.getSiblingsForId('original').length).toEqual(0);
    expect(service.getSiblingsForId('one').length).toEqual(0);
    expect(service.getSiblingsForId('two').length).toEqual(1);
    expect(service.getSiblingsForId('two_two').length).toEqual(1);

    expect(service.getSiblingsForId('three').length).toEqual(2);
    expect(service.getSiblingsForId('three_two').length).toEqual(2);
    expect(service.getSiblingsForId('three_three').length).toEqual(2);
  });

  it('should handle duplicates', () => {
    service.addItem('one', 'original');
    service.addItem('one', 'new_parent');

    expect(service.getParentForId('one')).toEqual('new_parent');
    expect(service.getLinkedDatasetInfo().length).toEqual(1);

    service.addItem('two', 'one');
    service.addItem('three', 'one');
    service.addItem('four', 'one');

    expect(service.getLinkedDatasetInfo().length).toEqual(4);

    service.addItem('four', 'one');
    expect(service.getLinkedDatasetInfo().length).toEqual(1);
  });
});
