import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createMockPipe } from '../../_mocked';

import { FilterOpsComponent } from '.';

describe('FilterOpsComponent', () => {
  let component: FilterOpsComponent;
  let fixture: ComponentFixture<FilterOpsComponent>;
  const testVal1 = 'VALUE 1';
  const testVal2 = 'VALUE 2';
  const testDate1 = '2019-04-01';
  const testDate2 = '2019-04-30';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterOpsComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(FilterOpsComponent);
    component = fixture.componentInstance;
    component.clearParams();
    fixture.detectChanges();
  });

  it('detects the setting of any value', () => {
    expect(component.anyValueSet()).toBeFalsy();
    component.addParam('WORKFLOW', { value: testVal1 });
    expect(component.anyValueSet()).toBeTruthy();
  });

  it('manages parameters', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: testVal1, group: 'GROUP' }, false);
    expect(component.params.WORKFLOW.length).toEqual(1);
  });

  it('manages single parameters', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: testVal1 }, false);
    expect(component.params.WORKFLOW.length).toEqual(1);
    expect(component.params.WORKFLOW[0].value).toEqual(testVal1);

    component.addParam('WORKFLOW', { value: testVal2 }, false);
    expect(component.params.WORKFLOW.length).toEqual(1);
    expect(component.params.WORKFLOW[0].value).toEqual(testVal2);
  });

  it('manages multiple parameters', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('WORKFLOW', { value: testVal2, group: 'GROUP' }, true, 2);
    expect(component.params.WORKFLOW.length).toEqual(2);
  });

  it('tracks what values have been set', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeFalsy();
    expect(component.valueIsSet('WORKFLOW', testVal2)).toBeFalsy();

    component.addParam('WORKFLOW', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('WORKFLOW', { value: testVal2, group: 'GROUP' }, true, 2);

    expect(component.valueIsSet('WORKFLOW', testVal1, 1)).toBeTruthy();
    expect(component.valueIsSet('WORKFLOW', testVal2, 2)).toBeTruthy();
  });

  it('tracks the index of set values', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeFalsy();
    expect(component.valueIsSet('WORKFLOW', testVal2)).toBeFalsy();

    component.addParam('WORKFLOW', { value: testVal1, group: 'GROUP' }, true, 1);
    component.addParam('WORKFLOW', { value: testVal2, group: 'GROUP' }, true, 2);

    expect(component.valueIndex('WORKFLOW', testVal1, 1)).toEqual(0);
    expect(component.valueIndex('WORKFLOW', testVal2, 2)).toEqual(1);
  });

  it('can set values from inputs', () => {
    expect(component.valueIsSet('WORKFLOW', testVal1, 0)).toBeFalsy();
    const el = Object.assign(document.createElement('input'), {
      value: testVal1,
    }) as HTMLInputElement;

    component.restoreParamFromInput('WORKFLOW', el);
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeTruthy();
  });

  it('can restore multiple values from inputs in the same group', () => {
    component.showing = true;
    fixture.detectChanges();

    expect(component.params.DATE.map((p) => p.value)).toEqual([]);

    fixture.nativeElement.querySelector('#date-from').value = testDate1;
    fixture.nativeElement.querySelector('#date-to').value = testDate2;

    const elFrom = document.querySelector('#date-from');
    const elTo = document.querySelector('#date-to');

    if (elFrom && elTo) {
      (elFrom as HTMLInputElement).dispatchEvent(new Event('change'));
      (elTo as HTMLInputElement).dispatchEvent(new Event('change'));
    }

    expect(component.params.DATE.map((p) => p.value)).toEqual([testDate1, testDate2]);

    component.clearParams();
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);

    if (elFrom) {
      (elFrom as HTMLInputElement).dispatchEvent(new Event('focus'));
    }

    expect(component.params.DATE.map((p) => p.value).indexOf(testDate1)).toBeGreaterThan(-1);
    expect(component.params.DATE.map((p) => p.value).indexOf(testDate2)).toBeGreaterThan(-1);

    component.clearParams();
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);

    if (elTo) {
      (elTo as HTMLInputElement).dispatchEvent(new Event('focus'));
    }

    expect(component.params.DATE.map((p) => p.value).indexOf(testDate1)).toBeGreaterThan(-1);
    expect(component.params.DATE.map((p) => p.value).indexOf(testDate2)).toBeGreaterThan(-1);
  });

  it('can clear single values', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: 'VALUE 1', group: 'GROUP' }, true);
    component.addParam('WORKFLOW', { value: 'VALUE 2', group: 'GROUP' }, true);
    expect(component.params.WORKFLOW.length).toEqual(2);
    expect(component.params.WORKFLOW.map((p) => p.value)).toEqual(['VALUE 1', 'VALUE 2']);

    component.clearParamValue('WORKFLOW', 'VALUE 1');
    expect(component.params.WORKFLOW.length).toEqual(1);
    expect(component.params.WORKFLOW[0].value).toEqual('VALUE 2');
    expect(component.params.WORKFLOW.map((p) => p.value)).toEqual(['VALUE 2']);
  });

  it('can clear multiple values', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: 'VALUE 1', group: 'GROUP' }, true);
    component.addParam('WORKFLOW', { value: 'VALUE 2', group: 'GROUP' }, true);
    expect(component.params.WORKFLOW.length).toEqual(2);

    component.clearParam('WORKFLOW');
    expect(component.params.WORKFLOW.length).toEqual(0);
  });

  it('can clear values by input ref', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    component.addParam('WORKFLOW', { value: 'VALUE 1', group: 'GROUP' }, true, 1);
    component.addParam('WORKFLOW', { value: 'VALUE 2', group: 'GROUP' }, true, 2);
    expect(component.params.WORKFLOW.length).toEqual(2);

    component.clearParamValuesByInputRef('WORKFLOW', 1);
    expect(component.params.WORKFLOW.length).toEqual(1);
    component.clearParamValuesByInputRef('WORKFLOW', 2);
    expect(component.params.WORKFLOW.length).toEqual(0);
  });

  it('toggles values when same value re-set', () => {
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeFalsy();
    component.toggleParamValue('WORKFLOW', { value: testVal1 });
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeTruthy();
    component.toggleParamValue('WORKFLOW', { value: testVal1 });
    expect(component.valueIsSet('WORKFLOW', testVal1)).toBeFalsy();
  });

  // (will return the params once integrated with back end)
  it('should show the params', () => {
    expect(component.showParams()).toBeFalsy();
  });

  it('should hide', () => {
    // fixture.detectChanges();
    component.showing = true;
    component.hide();
    expect(component.showing).toBeFalsy();
  });

  it('should toggle visibility', () => {
    component.showing = false;
    expect(component.showing).toBeFalsy();
    component.toggle();
    expect(component.showing).toBeTruthy();
    component.toggle();
    expect(component.showing).toBeFalsy();
  });
});
