import { FilterOpsComponent } from '.';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';

import { createMockPipe } from '../../_mocked';

fdescribe('FilterOpsComponent', () => {
  let component: FilterOpsComponent;
  let fixture: ComponentFixture<FilterOpsComponent>;
  const testVal = 'xxx';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterOpsComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(FilterOpsComponent);
    component = fixture.componentInstance;
  });

  it('manages paramters', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE', group: 'GROUP' }, 0, 1);
    expect(component.params['workflow'].length).toEqual(1);
  });

  it('manages multiple paramters', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, 1, 1);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, 1, 2);
    expect(component.params['workflow'].length).toEqual(2);
  });

  it('tracks what values have been set', () => {
    expect(component.params['workflow'].length).toEqual(0);
    expect(component.valueIsSet('workflow', 'VALUE 1')).toBeFalsy();
    expect(component.valueIsSet('workflow', 'VALUE 2')).toBeFalsy();

    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, 1, 1);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, 1, 2);

    expect(component.valueIsSet('workflow', 'VALUE 1', 1)).toBeTruthy();
    expect(component.valueIsSet('workflow', 'VALUE 2', 2)).toBeTruthy();
  });

  it('tracks the index of set values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    expect(component.valueIsSet('workflow', 'VALUE 1')).toBeFalsy();
    expect(component.valueIsSet('workflow', 'VALUE 2')).toBeFalsy();

    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, 1, 1);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, 1, 2);

    expect(component.valueIndex('workflow', 'VALUE 1', 1)).toEqual(0);
    expect(component.valueIndex('workflow', 'VALUE 2', 2)).toEqual(1);
  });

  it('can set values from inputs', () => {
    expect(component.valueIsSet('workflow', testVal, 0)).toBeFalsy();
    let el = document.createElement('input');
    el.value = testVal;
    component.restoreParamFromInput('workflow', el, 'group', 0, 0);
    expect(component.valueIsSet('workflow', testVal, 0)).toBeTruthy();
  });

  it('can clear single values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, 1);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, 1);
    expect(component.params['workflow'].length).toEqual(2);

    component.clearParamValue('workflow', 'VALUE 1');
    expect(component.params['workflow'].length).toEqual(1);
    expect(component.params['workflow'][0].value).toEqual('VALUE 2');
  });

  it('can clear multiple values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, 1);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, 1);
    expect(component.params['workflow'].length).toEqual(2);

    component.clearParam('workflow');
    expect(component.params['workflow'].length).toEqual(0);
  });

  it('toggles values when re-set', () => {
    expect(component.valueIsSet('workflow', testVal)).toBeFalsy();
    component.toggleParamValue('workflow', { value: testVal }, 0);
    expect(component.valueIsSet('workflow', testVal)).toBeTruthy();
    component.toggleParamValue('workflow', { value: testVal }, 0);
    expect(component.valueIsSet('workflow', testVal)).toBeFalsy();
  });

  it('should hide', () => {
    //fixture.detectChanges();
    component.showing = true;
    component.hide();
    expect(component.showing).toBeFalsy();
  });

  it('should toggle visibility', () => {
    component.showing = false;
    expect(component.showing).toBeFalsy();
    component.toggle();
    expect(component.showing).toBeTruthy();
  });
});
