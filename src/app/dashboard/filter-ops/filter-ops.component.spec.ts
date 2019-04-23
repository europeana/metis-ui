import { FilterOpsComponent } from '.';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';

import { createMockPipe } from '../../_mocked';

fdescribe('FilterOpsComponent', () => {
  let component: FilterOpsComponent;
  let fixture: ComponentFixture<FilterOpsComponent>;
  const testVal1 = 'VALUE 1';
  const testVal2 = 'VALUE 2';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterOpsComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(FilterOpsComponent);
    component = fixture.componentInstance;
    component.clearParams();
  });

  it('manages paramters', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: testVal1, group: 'GROUP' }, false);
    expect(component.params['workflow'].length).toEqual(1);
  });

  it('manages single paramters', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: testVal1 }, false);
    expect(component.params['workflow'].length).toEqual(1);
    expect(component.params['workflow'][0].value).toEqual(testVal1);

    console.log('--');
    console.log('--');
    component.addParam('workflow', { value: testVal2 }, false);
    expect(component.params['workflow'].length).toEqual(1);
    expect(component.params['workflow'][0].value).toEqual(testVal2);
  });

  it('manages multiple paramters', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('workflow', { value: testVal2, group: 'GROUP' }, true, 2);
    expect(component.params['workflow'].length).toEqual(2);
  });

  it('tracks what values have been set', () => {
    expect(component.params['workflow'].length).toEqual(0);
    expect(component.valueIsSet('workflow', testVal1)).toBeFalsy();
    expect(component.valueIsSet('workflow', testVal2)).toBeFalsy();

    component.addParam('workflow', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('workflow', { value: testVal2, group: 'GROUP' }, true, 2);

    expect(component.valueIsSet('workflow', testVal1, 1)).toBeTruthy();
    expect(component.valueIsSet('workflow', testVal2, 2)).toBeTruthy();
  });

  it('tracks the index of set values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    expect(component.valueIsSet('workflow', testVal1)).toBeFalsy();
    expect(component.valueIsSet('workflow', testVal2)).toBeFalsy();

    component.addParam('workflow', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('workflow', { value: testVal2, group: 'GROUP' }, true, 2);

    expect(component.valueIndex('workflow', testVal1, 1)).toEqual(0);
    expect(component.valueIndex('workflow', testVal2, 2)).toEqual(1);
  });

  it('can set values from inputs', () => {
    expect(component.valueIsSet('workflow', testVal1, 0)).toBeFalsy();
    let el = document.createElement('input');
    el.value = testVal1;
    component.restoreParamFromInput('workflow', el, 'group', false, 0);
    expect(component.valueIsSet('workflow', testVal1, 0)).toBeTruthy();
  });

  it('can clear single values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, true);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, true);
    expect(component.params['workflow'].length).toEqual(2);

    component.clearParamValue('workflow', 'VALUE 1');
    expect(component.params['workflow'].length).toEqual(1);
    expect(component.params['workflow'][0].value).toEqual('VALUE 2');
  });

  it('can clear multiple values', () => {
    expect(component.params['workflow'].length).toEqual(0);
    component.addParam('workflow', { value: 'VALUE 1', group: 'GROUP' }, true);
    component.addParam('workflow', { value: 'VALUE 2', group: 'GROUP' }, true);
    expect(component.params['workflow'].length).toEqual(2);

    component.clearParam('workflow');
    expect(component.params['workflow'].length).toEqual(0);
  });

  it('toggles values when same value re-set', () => {
    expect(component.valueIsSet('workflow', testVal1)).toBeFalsy();
    component.toggleParamValue('workflow', { value: testVal1 });
    expect(component.valueIsSet('workflow', testVal1)).toBeTruthy();
    component.toggleParamValue('workflow', { value: testVal1 });
    expect(component.valueIsSet('workflow', testVal1)).toBeFalsy();
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
