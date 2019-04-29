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

  it('detects the setting of any value', () => {
    expect(component.anyValueSet()).toBeFalsy();
    const testEl = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl.nativeElement.click();
    expect(component.anyValueSet()).toBeTruthy();
  });

  it('manages parameters', () => {
    expect(component.params.STATUS.length).toEqual(0);
    const testEl = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl.nativeElement.click();
    expect(component.params.STATUS.length).toEqual(1);
  });

  it('manages single parameters', () => {
    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(14) a'));
    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(15) a'));

    testEl1.nativeElement.click();
    component.showParams();

    expect(component.params.DATE[0].value).toEqual('1');

    testEl2.nativeElement.click();
    component.showParams();

    expect(component.params.DATE[0].value).toEqual('7');
    expect(component.params.DATE.length).toEqual(1);
  });

  it('manages multiple parameters', () => {
    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(3) a'));

    expect(testEl1.nativeElement.textContent).toEqual('Check Links');
    expect(testEl2.nativeElement.textContent).toEqual('Enrich');

    testEl1.nativeElement.click();
    fixture.detectChanges();
    component.showParams();

    expect(component.params.WORKFLOW[0].value).toEqual('LINK_CHECKING');

    testEl2.nativeElement.click();
    fixture.detectChanges();
    component.showParams();

    expect(component.params.WORKFLOW[1].value).toEqual('ENRICHMENT');
  });

  it('can restore a value from an input', () => {
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);
    const dateFrom = fixture.debugElement.query(By.css('#date-from'));
    dateFrom.nativeElement.value = testDate1;
    dateFrom.nativeElement.dispatchEvent(new Event('focus'));
    expect(component.params.DATE.map((p) => p.value)).toEqual([testDate1]);
  });

  it('can restore multiple values from inputs in the same group', () => {
    expect(component.params.DATE.map((p) => p.value)).toEqual([]);

    const dateFrom = fixture.debugElement.query(By.css('#date-from'));
    const dateTo = fixture.debugElement.query(By.css('#date-to'));

    expect(dateFrom).toBeTruthy();
    expect(dateTo).toBeTruthy();

    dateFrom.nativeElement.value = testDate1;
    dateTo.nativeElement.value = testDate2;

    component.restoreGroup('date-pair', component.optionComponents.toArray()[0].index);
    expect(component.params.DATE.map((p) => p.value)).toEqual([testDate1, testDate2]);
  });

  it('can reset', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);

    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(3) a'));

    testEl1.nativeElement.click();
    testEl2.nativeElement.click();

    expect(component.params.WORKFLOW.length).toEqual(2);
    component.reset();
    expect(component.params.WORKFLOW.length).toEqual(0);
  });

  it('toggles values when same value re-set', () => {
    expect(component.params.WORKFLOW.length).toEqual(0);
    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));

    testEl1.nativeElement.click();
    expect(component.params.WORKFLOW.length).toEqual(1);

    testEl1.nativeElement.click();
    expect(component.params.WORKFLOW.length).toEqual(0);
  });

  it('can invoke callbacks after changes to inputs', () => {
    const dateFrom = fixture.debugElement.query(By.css('#date-from'));
    spyOn(dateFrom.componentInstance.config.input, 'cbFnOnSet');
    dateFrom.nativeElement.value = testDate1;
    dateFrom.nativeElement.dispatchEvent(new Event('change'));
    expect(dateFrom.componentInstance.config.input.cbFnOnSet).toHaveBeenCalled();
  });

  it('uses callbacks to link the dates', () => {
    const dateFrom = fixture.debugElement.query(By.css('#date-from'));
    const dateTo = fixture.debugElement.query(By.css('#date-to'));
    dateFrom.nativeElement.value = testDate1;
    dateFrom.nativeElement.dispatchEvent(new Event('change'));
    dateTo.nativeElement.value = testDate2;
    dateTo.nativeElement.dispatchEvent(new Event('change'));
    expect(dateTo.nativeElement.getAttribute('min')).toBeTruthy();
    expect(dateFrom.nativeElement.getAttribute('max')).toBeTruthy();
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

  it('should set a summary (menu tooltip)', () => {
    expect(component.getSetSummary()).toBeFalsy();

    const testEl1 = fixture.debugElement.query(By.css('.filter-cell:nth-of-type(2) a'));
    testEl1.nativeElement.click();

    expect(component.getSetSummary()).toEqual('Workflow');

    const testEl2 = fixture.debugElement.query(By.css('.filter-cell:last-of-type a'));
    testEl2.nativeElement.click();

    expect(component.getSetSummary()).toEqual('Workflow, Status');
  });
});
