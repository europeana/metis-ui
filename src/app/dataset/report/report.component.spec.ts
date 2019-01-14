import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { MockErrorService, mockReport, MockWorkflowService } from '../../_mocked';
import { ErrorService, WorkflowService } from '../../_services';

import { ReportComponent } from '.';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReportComponent],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    workflows = TestBed.get(WorkflowService);
  });

  it('should not be loading/visible if no report request', () => {
    expect(component.isLoading).toBeFalsy();
    expect(component.isVisible).toBeFalsy();
    component.reportRequest = undefined;
    expect(component.isLoading).toBeFalsy();
    expect(component.isVisible).toBeFalsy();
  });

  it('should show a report request', () => {
    spyOn(workflows, 'getReport').and.callThrough();
    component.reportRequest = { taskId: '-5635646', topology: 'validation' };
    expect(workflows.getReport).toHaveBeenCalledWith('-5635646', 'validation');

    expect(component.isVisible).toBe(true);
    expect(component.errors).toEqual(mockReport.errors);
  });

  it('should handle an empty report', () => {
    spyOn(workflows, 'getReport').and.returnValue(of({ id: 5466, errors: [] }));
    component.reportRequest = { taskId: '-5635646', topology: 'validation' };
    expect(workflows.getReport).toHaveBeenCalledWith('-5635646', 'validation');

    expect(component.isVisible).toBe(true);
    expect(component.errors).toEqual([]);
    expect(component.notification!.content).toEqual('Report is empty.');
  });

  it('should handle an error', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'server error' });
    spyOn(workflows, 'getReport').and.returnValue(throwError(error));
    component.reportRequest = { taskId: '-5635646', topology: 'validation' };
    expect(workflows.getReport).toHaveBeenCalledWith('-5635646', 'validation');

    expect(component.isVisible).toBe(true);
    expect(component.notification!.content).toBe('500 server error');
  });

  it('should get the keys from an object', () => {
    expect(component.reportKeys({ a: 5, b: 67, zeta: 65 })).toEqual(['a', 'b', 'zeta']);
  });

  it('should close the report window', () => {
    spyOn(component.closed, 'emit');
    component.closeReport();
    expect(component.closed.emit).toHaveBeenCalledWith();
  });

  it('should determine whether something is an object', () => {
    expect(component.isObject({})).toBe(true);
    expect(component.isObject(component)).toBe(true);

    expect(component.isObject(true)).toBe(false);
    expect(component.isObject(1)).toBe(false);
    expect(component.isObject('665')).toBe(false);
    expect(component.isObject(() => {})).toBe(false);
    expect(component.isObject(undefined)).toBe(false);
  });
});
