import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  MockDatasetsService,
  MockErrorService,
  mockPluginExecution,
  MockWorkflowService
} from '../_mocked';
import { SimpleReportRequest } from '../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';

import { DatasetComponent } from '.';
import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DatasetComponent, createMockPipe('translate')],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    workflows = TestBed.get(WorkflowService);
  });

  it('responds to form initialisation by setting it in the header', () => {
    component.workflowFormRef = { onHeaderSynchronised: () => {} } as WorkflowComponent;
    const mockHeader = new WorkflowHeaderComponent();
    mockHeader.elRef = { nativeElement: {} } as ElementRef;
    component.workflowHeaderRef = mockHeader;
    spyOn(component.workflowFormRef, 'onHeaderSynchronised');
    component.formInitialised({} as FormGroup);
    expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
  });

  it('should get dataset info', () => {
    component.loadData();
    fixture.detectChanges();
    expect(component.lastExecutionSubscription.closed).toBe(false);
  });

  it('should switch tabs', () => {
    fixture.detectChanges();

    component.activeTab = 'edit';
    component.datasetIsLoading = false;
    component.workflowIsLoading = false;
    component.lastExecutionIsLoading = false;
    component.harvestIsLoading = false;

    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'workflow';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'mapping';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'preview';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'log';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();
  });

  it('should be possible to display a message', () => {
    component.showPluginLog = mockPluginExecution;
    fixture.detectChanges();
    expect(component.showPluginLog).toBe(mockPluginExecution);
  });

  it('should set a report message', () => {
    expect(component.reportMsg).toBeFalsy();

    const srrM = {
      message: 'message'
    } as SimpleReportRequest;

    const srrE = {
      topology: 'http_harvest',
      taskId: 'taskId'
    } as SimpleReportRequest;

    component.setReportMsg(srrE);
    expect(component.reportMsg).toBeFalsy();

    component.setReportMsg(srrM);
    expect(component.reportMsg).toBeTruthy();
  });

  it('should start a workflow', () => {
    spyOn(workflows, 'startWorkflow').and.callThrough();
    component.datasetId = '65';
    component.startWorkflow();
    expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
  });

  it('should update data', () => {
    spyOn(component, 'loadData');
    component.datasetUpdated();
    expect(component.loadData).toHaveBeenCalled();
  });
});
