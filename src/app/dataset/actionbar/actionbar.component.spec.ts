import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  createMockPipe,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionResults,
  MockWorkflowService
} from '../../_mocked';
import { WorkflowStatus } from '../../_models';
import { WorkflowService } from '../../_services';

import { ActionbarComponent } from '.';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ActionbarComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [{ provide: WorkflowService, useClass: MockWorkflowService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;
    component.workflowData = mockWorkflow;
    fixture.detectChanges();
    workflows = TestBed.inject(WorkflowService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update fields based on the last execution', () => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[4];
    expect(component.currentPlugin!.id).toBe('432552345');
    expect(component.currentStatus).toBe('FINISHED');
    expect(component.currentExternalTaskId).toBe('123');
    expect(component.currentTopology).toBe('normalization');
    expect(component.totalErrors).toBe(0);
    expect(component.totalProcessed).toBe(1000);
    expect(component.totalInDataset).toBe(1000);
  });

  it('should do click to show logging', (): void => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[1];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.RUNNING);

    spyOn(component.setShowPluginLog, 'emit');
    const button = fixture.debugElement.query(By.css('.log-btn'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should cancel', (): void => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[1];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.RUNNING);

    spyOn(workflows, 'promptCancelThisWorkflow');
    const cancel = fixture.debugElement.query(By.css('.dataset-actionbar nav .cancel-btn'));
    expect(cancel).toBeTruthy();

    cancel.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(workflows.promptCancelThisWorkflow).toHaveBeenCalledWith(
      '253453453',
      (undefined as unknown) as string,
      (undefined as unknown) as string
    );
  });

  it('should run a workflow', (): void => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[4];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.FINISHED);

    spyOn(component.startWorkflow, 'emit');
    const run = fixture.debugElement.query(By.css('.newaction-btn'));
    run.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });

  it('should have a running workflow', (): void => {
    component.lastExecutionData = mockWorkflowExecutionResults.results[1];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress')).toBeTruthy();
  });

  it('should show a report button and open report', (): void => {
    component.lastExecutionData = mockWorkflowExecution;
    component.totalErrors = 10;
    component.hasReport = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.svg-icon-report')).toBeTruthy();

    spyOn(component.setReportMsg, 'emit');
    const reportBtn = fixture.debugElement.query(By.css('.report-btn'));
    reportBtn.triggerEventHandler('click', null);
    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: 'normalization',
      taskId: '123',
      message: undefined
    });
  });

  it('should copy information', (): void => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
