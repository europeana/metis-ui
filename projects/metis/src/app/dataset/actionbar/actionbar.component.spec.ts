import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  createMockPipe,
  MockTranslateService,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionResults,
  MockWorkflowService
} from '../../_mocked';
import {
  PluginExecution,
  PluginType,
  User,
  WorkflowExecution,
  WorkflowStatus
} from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { ActionbarComponent } from '.';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ActionbarComponent],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        }
      ]
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

  it('should begin the workflow', () => {
    component.cancelledBy = ({ firstName: 'A', lastName: 'B' } as unknown) as User;
    expect(component.cancelledBy).toBeTruthy();
    component.beginWorkflow();
    expect(component.cancelledBy).toBeFalsy();
  });

  it('should assign the execution data', () => {
    spyOn(component, 'assignExecutionData').and.callThrough();
    component.lastExecutionData = undefined;
    expect(component.assignExecutionData).not.toHaveBeenCalled();
    component.lastExecutionData = ({ metisPlugins: [{}] } as unknown) as WorkflowExecution;
    expect(component.assignExecutionData).toHaveBeenCalled();
    expect(component.totalInDataset).toBeFalsy();
    expect(component.now).toBeFalsy();
    component.lastExecutionData = ({
      workflowStatus: WorkflowStatus.CANCELLED,
      metisPlugins: [{}],
      updatedDate: 'XXX'
    } as unknown) as WorkflowExecution;
    expect(component.now).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    spyOn(component, 'showLog').and.callFake(() => {});
    component.showPluginLog = {} as PluginExecution;
    component.lastExecutionData = ({ metisPlugins: [{}] } as unknown) as WorkflowExecution;
    expect(component.showLog).toHaveBeenCalled();
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
    spyOn(workflows, 'promptCancelThisWorkflow');
    component.cancelWorkflow();
    fixture.detectChanges();
    expect(workflows.promptCancelThisWorkflow).not.toHaveBeenCalled();

    component.lastExecutionData = mockWorkflowExecutionResults.results[1];
    fixture.detectChanges();
    expect(component.lastExecutionData.workflowStatus).toBe(WorkflowStatus.RUNNING);

    component.cancelWorkflow();
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
      message: undefined,
      workflowExecutionId: '253453453',
      pluginType: PluginType.VALIDATION_EXTERNAL
    });
  });

  it('should copy information', (): void => {
    spyOn(navigator.clipboard, 'writeText');
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
