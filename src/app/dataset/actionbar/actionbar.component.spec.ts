import { RouterTestingModule } from '@angular/router/testing';
import {
  DatasetsService,
  WorkflowService,
  ErrorService,
  RedirectPreviousUrl,
  TranslateService,
} from '../../_services';
import {
  MockWorkflowService,
  MockDatasetService,
  currentWorkflow,
  MockTranslateService,
  currentWorkflowDataset,
} from '../../_mocked';

import { TranslatePipe, RenameWorkflowPipe } from '../../_translate';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionbarComponent } from './actionbar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WorkflowStatus } from '../../_models/workflow-execution';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ActionbarComponent, TranslatePipe, RenameWorkflowPipe],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetService },
        ErrorService,
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;
    component.workflowData = currentWorkflowDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update fields based on the last execution', () => {
    component.lastExecutionData = currentWorkflow['results'][4];
    expect(component.currentPlugin!.id).toBe('432552345');
    expect(component.currentStatus).toBe('FINISHED');
    expect(component.currentExternalTaskId).toBe('123');
    expect(component.currentTopology).toBe('mocked');
    expect(component.totalErrors).toBe(0);
    expect(component.totalProcessed).toBe(1000);
    expect(component.totalInDataset).toBe(1000);
  });

  it('should do click to show logging', (): void => {
    component.lastExecutionData = currentWorkflow['results'][1];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.RUNNING);

    spyOn(component.setShowPluginLog, 'emit');
    const button = fixture.debugElement.query(By.css('.log-btn'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should cancel', (): void => {
    component.lastExecutionData = currentWorkflow['results'][1];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.RUNNING);

    spyOn(component.workflows, 'promptCancelThisWorkflow');
    const cancel = fixture.debugElement.query(By.css('.dataset-actionbar nav .cancel-btn'));
    cancel.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.workflows.promptCancelThisWorkflow).toHaveBeenCalledWith('253453453');
  });

  it('should run a workflow', (): void => {
    component.lastExecutionData = currentWorkflow.results[4];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.FINISHED);

    spyOn(component.startWorkflow, 'emit');
    const run = fixture.debugElement.query(By.css('.newaction-btn'));
    run.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });

  it('should have a running workflow', (): void => {
    component.lastExecutionData = currentWorkflow.results[1];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress')).toBeTruthy();
  });

  it('should show a report button and open report', (): void => {
    component.lastExecutionData = currentWorkflow.results[0];
    component.totalErrors = 10;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.svg-icon-report')).toBeTruthy();

    spyOn(component.setReportRequest, 'emit');
    const reportBtn = fixture.debugElement.query(By.css('.report-btn'));
    reportBtn.triggerEventHandler('click', null);
    expect(component.setReportRequest.emit).toHaveBeenCalledWith({
      taskId: '123',
      topology: 'mocked',
    });
  });

  it('should copy information', (): void => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
