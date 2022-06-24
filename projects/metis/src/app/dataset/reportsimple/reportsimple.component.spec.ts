import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  createMockPipe,
  MockTranslateService,
  MockWorkflowService,
  mockXmlSamples
} from '../../_mocked';
import { PluginType } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { ReportSimpleComponent } from '.';

describe('ReportSimpleComponent', () => {
  let component: ReportSimpleComponent;
  let fixture: ComponentFixture<ReportSimpleComponent>;
  let workflows: WorkflowService;

  const mockError = {
    errorType: 'my type',
    message: 'oh no',
    occurrences: 1,
    errorDetails: []
  };
  const reportRequest = { workflowExecutionId: '1' };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [createMockPipe('renameWorkflow'), ReportSimpleComponent],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: WorkflowService, useClass: MockWorkflowService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    workflows = TestBed.inject(WorkflowService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not be visible or loading by default', () => {
    expect(component.reportLoading).toBeFalsy();
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if a simple message is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportRequest = { message: 'Hello' };
    expect(component.isVisible).toBeTruthy();
  });

  it('should not show if an undefined message is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportRequest = { message: '' };
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if an errors array is provided', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportRequest = { errors: [mockError] };
    expect(component.isVisible).toBeTruthy();
  });

  it('should not show if the provided errors array is null', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportRequest = { errors: undefined };
    expect(component.isVisible).toBeFalsy();
  });

  it('should show if loading', () => {
    expect(component.isVisible).toBeFalsy();
    component.reportLoading = true;
    expect(component.isVisible).toBeTruthy();
    component.reportLoading = false;
    expect(component.isVisible).toBeTruthy();
  });

  it('should warn if the provided errors array is empty', () => {
    expect(component.isVisible).toBeFalsy();
    expect(component.notification).toBeFalsy();
    component.reportRequest = { errors: [] };
    expect(component.isVisible).toBeTruthy();
    expect(component.notification!.content).toEqual('en:reportEmpty');
  });

  it('should detect if an item is downloadable', () => {
    component.reportRequest = { pluginType: PluginType.TRANSFORMATION };
    expect(component.isDownloadable()).toBeTruthy();
    component.reportRequest = { pluginType: PluginType.NORMALIZATION };
    expect(component.isDownloadable()).toBeTruthy();
    component.reportRequest = { pluginType: PluginType.OAIPMH_HARVEST };
    expect(component.isDownloadable()).toBeFalsy();
    component.reportRequest = { pluginType: PluginType.HTTP_HARVEST };
    expect(component.isDownloadable()).toBeFalsy();
  });

  it('should get the keys from an object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(component.reportKeys((undefined as unknown) as Record<string, any>)).toEqual([]);
    expect(component.reportKeys({ a: 5, b: 67, zeta: 65 })).toEqual(['a', 'b', 'zeta']);
  });

  it('should download the record', () => {
    spyOn(workflows, 'getWorkflowRecordsById').and.callFake(() => {
      return of(mockXmlSamples);
    });
    component.reportRequest = reportRequest;

    component.downloadRecord('1-2-3', {});
    expect(workflows.getWorkflowRecordsById).not.toHaveBeenCalled();
    component.downloadRecord('http://records/123', {});
    expect(workflows.getWorkflowRecordsById).toHaveBeenCalled();
    component.downloadRecord('1-2-3', {});
    expect(workflows.getWorkflowRecordsById).toHaveBeenCalledTimes(1);
    component.downloadRecord('XYZ', {});
    expect(workflows.getWorkflowRecordsById).toHaveBeenCalledTimes(2);
    component.downloadRecord('http:', {});
    expect(workflows.getWorkflowRecordsById).toHaveBeenCalledTimes(2);
    component.downloadRecord('http://records/123/456', {});
    expect(workflows.getWorkflowRecordsById).toHaveBeenCalledTimes(3);
  });

  it('should close the report window', () => {
    spyOn(component.closeReport, 'emit');
    component.close();
    expect(component.closeReport.emit).toHaveBeenCalledWith();
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
    component.reportRequest = Object.assign(reportRequest, { errors: [mockError] });
    fixture.detectChanges();
    component.copyReport({
      getSelection: (): null => {
        return null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(component.notification).toBeFalsy();
    component.copyReport();
    expect(component.notification!.content).toBe('en:reportCopied');
  });

  it('should split the camel case', () => {
    expect(component.splitCamelCase('helloThere')).toEqual('hello There');
  });
});
