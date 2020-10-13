import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createMockPipe } from '../../_mocked';

import { FilterOpsComponent, FilterOptionComponent } from '.';

describe('FilterOpsComponent', () => {
  let component: FilterOpsComponent;
  let fixture: ComponentFixture<FilterOpsComponent>;
  const testDate1 = '2019-04-01';
  const testDate2 = '2019-04-30';
  const testDateF = '2100-01-01';
  const testDate1_plus1 = '2019-04-02';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterOpsComponent, FilterOptionComponent, createMockPipe('translate')],
      schemas: [NO_ERRORS_SCHEMA]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterOpsComponent);
    component = fixture.componentInstance;
    component.title = 'Test Filter';
    fixture.detectChanges();
  });

  it('has an error if an invalid value is set (no date support)', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));
    fromDate.nativeElement.removeAttribute('type');
    toDate.nativeElement.removeAttribute('type');
    fixture.detectChanges();
    expect(fromDate.nativeElement.closest('.filter-cell').classList.contains('error')).toBeFalsy();
    expect(toDate.nativeElement.closest('.filter-cell').classList.contains('error')).toBeFalsy();

    fromDate.nativeElement.value = 'invalid';
    fromDate.nativeElement.dispatchEvent(new Event('change'));
    toDate.nativeElement.value = 'invalid';
    toDate.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fromDate.nativeElement.closest('.filter-cell').classList.contains('error')).toBeTruthy();
    expect(toDate.nativeElement.closest('.filter-cell').classList.contains('error')).toBeTruthy();
  });

  it('detects the setting of any value', () => {
    expect(component.anyValueSet()).toBeFalsy();
    const testEl = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl.nativeElement.click();
    expect(component.anyValueSet()).toBeTruthy();
  });

  it('detects errors in any value', () => {
    expect(component.anyErrors()).toBeFalsy();
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    fromDate.nativeElement.removeAttribute('type');
    fromDate.nativeElement.value = 'invalid';
    fromDate.nativeElement.dispatchEvent(new Event('change'));
    expect(component.anyErrors()).toBeTruthy();
  });

  it('manages parameters', () => {
    expect(component.params.pluginStatus.length).toEqual(0);
    const testEl = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl.nativeElement.click();
    expect(component.params.pluginStatus.length).toEqual(1);
  });

  it('manages single parameters', () => {
    const indexFieldDateFrom = 15;
    const indexFieldDateTo = 16;
    const testEl1 = fixture.debugElement.query(
      By.css(`.filter-cell:nth-of-type(${indexFieldDateFrom}) a`)
    );
    const testEl2 = fixture.debugElement.query(
      By.css(`.filter-cell:nth-of-type(${indexFieldDateTo}) a`)
    );
    testEl1.nativeElement.click();
    expect(component.params.DATE[0].value).toEqual('1');
    testEl2.nativeElement.click();
    expect(component.params.DATE[0].value).toEqual('7');
    expect(component.params.DATE.length).toEqual(1);
  });

  it('manages multiple parameters', () => {
    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(3) a'));

    expect(testEl1.nativeElement.textContent).toEqual('translate(Import HTTP)');
    expect(testEl2.nativeElement.textContent).toEqual('translate(Import OAI-PMH)');

    testEl1.nativeElement.click();
    fixture.detectChanges();
    expect(component.params.pluginType[0].value).toEqual('HTTP_HARVEST');

    testEl2.nativeElement.click();
    fixture.detectChanges();
    expect(component.params.pluginType[1].value).toEqual('OAIPMH_HARVEST');
  });

  it('can restore a value from an input', () => {
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    fromDate.nativeElement.value = testDate1;
    fromDate.nativeElement.dispatchEvent(new Event('focus'));
    expect(component.params.DATE.map((p) => p.value)).toEqual([testDate1]);
  });

  it('can restore multiple values from inputs in the same group', () => {
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);

    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    expect(fromDate).toBeTruthy();
    expect(toDate).toBeTruthy();

    fromDate.nativeElement.value = testDate1;
    toDate.nativeElement.value = testDate2;

    fromDate.nativeElement.dispatchEvent(new Event('change'));
    toDate.nativeElement.dispatchEvent(new Event('change'));

    component.restoreGroup('date-pair', component.optionComponents.toArray()[0].index);
    expect(component.params.DATE.map((p) => p.value)).toEqual([testDate1, testDate2]);
  });

  it('can calculate predefined ranges', () => {
    [1, 7, 30].forEach((param) => {
      expect(component.getFromToParam(param).indexOf('&fromDate')).toBeGreaterThan(-1);
      expect(component.getFromToParam(param).indexOf('&toDate')).toBeGreaterThan(-1);
    });
  });

  it('emits parameter string when hidden', () => {
    fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a')).nativeElement.click();
    spyOn(component.overviewParams, 'emit');
    expect(component.overviewParams.emit).not.toHaveBeenCalled();
    component.hide();
    expect(component.overviewParams.emit).toHaveBeenCalled();
  });

  it('emits parameter string toggled closed', () => {
    spyOn(component.overviewParams, 'emit');
    expect(component.overviewParams.emit).not.toHaveBeenCalled();

    component.toggle();

    expect(component.showing).toBe(true);
    expect(component.overviewParams.emit).not.toHaveBeenCalled();

    component.toggle();

    expect(component.showing).toBe(false);
    expect(component.overviewParams.emit).toHaveBeenCalled();
  });

  it('adjusts the toDate parameter by a day', () => {
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    toDate.nativeElement.value = testDate1;
    toDate.nativeElement.dispatchEvent(new Event('change'));

    const paramEvtSpy = spyOn(component.overviewParams, 'emit');

    component.updateParameters();

    expect((paramEvtSpy.calls.argsFor(0) + '').indexOf(testDate1)).toEqual(-1);
    expect((paramEvtSpy.calls.argsFor(0) + '').indexOf(testDate1_plus1)).toBeGreaterThan(-1);

    toDate.nativeElement.value = toDate.nativeElement.defaultValue;
    toDate.nativeElement.dispatchEvent(new Event('change'));

    component.updateParameters();

    expect((paramEvtSpy.calls.argsFor(1) + '').indexOf(testDate1)).toEqual(-1);
    expect((paramEvtSpy.calls.argsFor(1) + '').indexOf(testDate1_plus1)).toEqual(-1);
  });

  it('calculates date ranges for parameters', () => {
    fixture.debugElement.query(By.css('.filter-cell:nth-of-type(16) a')).nativeElement.click();

    const paramEvtSpy = spyOn(component.overviewParams, 'emit');
    expect(component.overviewParams.emit).not.toHaveBeenCalled();

    component.updateParameters();

    expect(component.overviewParams.emit).toHaveBeenCalled();
    expect((paramEvtSpy.calls.argsFor(0) + '').split('&').length).toEqual(3);
  });

  it('can reset', () => {
    expect(component.params.pluginType.length).toEqual(0);

    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(3) a'));

    testEl1.nativeElement.click();
    testEl2.nativeElement.click();

    expect(component.params.pluginType.length).toEqual(2);
    component.reset();
    expect(component.params.pluginType.length).toEqual(0);
  });

  it('toggles values when same value re-set', () => {
    expect(component.params.pluginType.length).toEqual(0);
    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));

    testEl1.nativeElement.click();
    expect(component.params.pluginType.length).toEqual(1);

    testEl1.nativeElement.click();
    expect(component.params.pluginType.length).toEqual(0);
  });

  it('can use callbacks to link the dates', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));
    fromDate.nativeElement.value = testDate1;
    fromDate.nativeElement.dispatchEvent(new Event('change'));
    toDate.nativeElement.value = testDate2;
    toDate.nativeElement.dispatchEvent(new Event('change'));
    expect(toDate.nativeElement.getAttribute('min')).toBeTruthy();
    expect(fromDate.nativeElement.getAttribute('max')).toBeTruthy();
  });

  it('enforces the min restriction', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    fromDate.nativeElement.value = testDate1_plus1;
    fromDate.nativeElement.dispatchEvent(new Event('change'));

    // set the to to be less than the min
    toDate.nativeElement.value = testDate1;
    toDate.nativeElement.dispatchEvent(new Event('change'));

    expect(toDate.nativeElement.value).toEqual(testDate1_plus1);
    expect(fromDate.nativeElement.value).toEqual(testDate1_plus1);
  });

  it('enforces the min restriction (no date support)', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    fromDate.nativeElement.removeAttribute('type');
    toDate.nativeElement.removeAttribute('type');

    fromDate.nativeElement.value = testDate1_plus1;
    fromDate.nativeElement.dispatchEvent(new Event('change'));

    // set the to to be less than the min
    toDate.nativeElement.value = testDate1;
    toDate.nativeElement.dispatchEvent(new Event('change'));

    expect(toDate.nativeElement.value).toEqual(testDate1_plus1);
    expect(fromDate.nativeElement.value).toEqual(testDate1_plus1);
  });

  it('enforces the max restriction (no date support)', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    toDate.nativeElement.setAttribute('max', testDate1);
    fromDate.nativeElement.setAttribute('max', testDate1);

    fromDate.nativeElement.removeAttribute('type');
    toDate.nativeElement.removeAttribute('type');

    // set the dates to exceed the max
    toDate.nativeElement.value = testDate1_plus1;
    toDate.nativeElement.dispatchEvent(new Event('change'));
    fromDate.nativeElement.value = testDate1_plus1;
    fromDate.nativeElement.dispatchEvent(new Event('change'));

    expect(fromDate.nativeElement.value).toEqual(testDate1);
    expect(toDate.nativeElement.value).toEqual(testDate1);
  });

  it('enforces the max restriction', () => {
    const fromDate = fixture.debugElement.query(By.css('#date-from'));
    const toDate = fixture.debugElement.query(By.css('#date-to'));

    toDate.nativeElement.value = testDate1;
    toDate.nativeElement.dispatchEvent(new Event('change'));

    // set the from to exceed the max
    fromDate.nativeElement.value = testDate1_plus1;
    fromDate.nativeElement.dispatchEvent(new Event('change'));

    expect(toDate.nativeElement.value).toEqual(testDate1);
    expect(fromDate.nativeElement.value).toEqual(testDate1);

    toDate.nativeElement.setAttribute('max', testDate1);
    toDate.nativeElement.value = testDateF;
    toDate.nativeElement.dispatchEvent(new Event('change'));
    expect(toDate.nativeElement.value).toEqual(testDate1);
  });

  it('should hide', () => {
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

  it('should set a summary (menu tooltip) if hidden', () => {
    expect(component.getSetSummary()).toBeFalsy();

    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    testEl1.nativeElement.click();

    expect(component.getSetSummary()).toEqual('Workflow');

    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl2.nativeElement.click();

    expect(component.getSetSummary()).toEqual('Workflow, Status');

    component.showing = true;
    expect(component.getSetSummary()).toEqual('');
  });
});
