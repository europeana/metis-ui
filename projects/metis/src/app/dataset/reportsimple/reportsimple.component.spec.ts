import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MockTranslateService } from '../../_mocked';
import { TranslateService } from '../../_translate';

import { ReportSimpleComponent } from '.';

describe('ReportSimpleComponent', () => {
  let component: ReportSimpleComponent;
  let fixture: ComponentFixture<ReportSimpleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportSimpleComponent],
      providers: [{ provide: TranslateService, useClass: MockTranslateService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not be visible or loading by default', () => {
    expect(component.loading).toBeFalsy();
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if a simple message is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportMsg = 'Hello';
    expect(component.isVisible).toBeTruthy();
  });

  it('should not show if an undefined message is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportMsg = '';
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if an errors array is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportErrors = ['Error'];
    expect(component.isVisible).toBeTruthy();
  });

  it('should not show if the provided errors array is null', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportErrors = null;
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if loading', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportLoading = true;
    expect(component.isVisible).toBeTruthy();
  });

  it('should warn if the provided errors array is empty', () => {
    expect(component.isVisible).toBeFalsy();
    expect(component.notification).toBeFalsy();
    component.reportErrors = [];
    expect(component.isVisible).toBeTruthy();
    expect(component.notification!.content).toEqual('en:reportEmpty');
  });

  it('should get the keys from an object', () => {
    expect(component.reportKeys({ a: 5, b: 67, zeta: 65 })).toEqual(['a', 'b', 'zeta']);
  });

  it('should close the report window', () => {
    spyOn(component.closeReportSimple, 'emit');
    component.closeReport();
    expect(component.closeReportSimple.emit).toHaveBeenCalledWith();
  });

  it('should determine whether something is an object', () => {
    expect(component.isObject({})).toBe(true);
    expect(component.isObject(component)).toBe(true);

    expect(component.isObject(true)).toBe(false);
    expect(component.isObject(1)).toBe(false);
    expect(component.isObject('665')).toBe(false);
    expect(component.isObject(() => undefined)).toBe(false);
    expect(component.isObject(undefined)).toBe(false);
  });

  it('should copy the report', () => {
    component.reportErrors = ['Error'];
    fixture.detectChanges();
    component.copyReport();
    expect(component.notification!.content).toBe('en:reportCopied');
  });
});
