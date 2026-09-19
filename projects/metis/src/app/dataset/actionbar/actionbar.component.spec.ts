import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createMockPipe } from 'shared';
import {
  MockTranslateService,
  mockWorkflow,
  mockWorkflowExecutionResults,
  MockWorkflowService
} from '../../_mocked';
import { WorkflowStatus } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { ActionbarComponent } from '.';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let workflows: WorkflowService;

  beforeEach(() => {
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
    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workflowData', mockWorkflow);
    fixture.componentRef.setInput('datasetId', '1');
    fixture.componentRef.setInput('datasetName', 'datasetName');
    fixture.detectChanges();
    workflows = TestBed.inject(WorkflowService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should begin the workflow', () => {
    spyOn(component.startWorkflow, 'emit');
    component.beginWorkflow();
    expect(component.startWorkflow.emit).toHaveBeenCalledTimes(1);
  });

  it('should assign the execution data', () => {
    spyOn(component, 'assignExecutionData').and.callThrough();

    fixture.componentRef.setInput('lastExecutionData', undefined);
    component.ngOnChanges({ lastExecutionData: { currentValue: undefined } as any });
    fixture.detectChanges();
    expect(component.assignExecutionData).not.toHaveBeenCalled();

    const mockExec = { metisPlugins: [{}] } as any;
    fixture.componentRef.setInput('lastExecutionData', mockExec);
    component.ngOnChanges({ lastExecutionData: { currentValue: mockExec } as any });
    fixture.detectChanges();

    expect(component.assignExecutionData).toHaveBeenCalled();
    expect(component.totalInDataset).toBeFalsy();
    expect(component.now).toBeFalsy();
  });

  it('should update fields based on the last execution', () => {
    const mockExec = {
      id: 'execution-123',
      metisPlugins: [
        {
          pluginStatus: 'FINISHED',
          pluginType: 'VALIDATION',
          externalTaskId: 'task-456',
          topologyName: 'validation-topology',
          executionProgress: {
            failRecords: 2,
            failDepublishRecords: 1,
            processedRecords: 100,
            expectedRecords: 500,
            progressPercentage: 20
          },
          updatedDate: '2026-09-19'
        }
      ]
    } as any;

    fixture.componentRef.setInput('lastExecutionData', mockExec);
    component.ngOnChanges({ lastExecutionData: { currentValue: mockExec } as any });
    fixture.detectChanges();

    expect(component.currentPluginName).toBe('VALIDATION');
    expect(component.totalErrors).toBe(3);
    expect(component.workflowPercentage).toBe(20);
  });

  it('should cancel', (): void => {
    spyOn(workflows, 'promptCancelThisWorkflow');
    component.cancelWorkflow();
    fixture.detectChanges();
    expect(workflows.promptCancelThisWorkflow).not.toHaveBeenCalled();

    fixture.componentRef.setInput('lastExecutionData', mockWorkflowExecutionResults.results[1]);

    fixture.detectChanges();
    expect(component.lastExecutionData()!.workflowStatus).toBe(WorkflowStatus.RUNNING);

    component.cancelWorkflow();
    fixture.detectChanges();
    expect(workflows.promptCancelThisWorkflow).toHaveBeenCalledWith(
      '253453453',
      '1',
      'datasetName'
    );
  });

  it('should run a workflow', (): void => {
    fixture.componentRef.setInput('lastExecutionData', mockWorkflowExecutionResults.results[4]);

    fixture.detectChanges();
    expect(component.lastExecutionData()!.workflowStatus).toBe(WorkflowStatus.FINISHED);

    spyOn(component.startWorkflow, 'emit');
    const run = fixture.debugElement.query(By.css('.newaction-btn'));
    run.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });

  it('should have a running workflow', (): void => {
    fixture.componentRef.setInput('lastExecutionData', mockWorkflowExecutionResults.results[1]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress')).toBeTruthy();
  });

  it('should show a report button and open report', () => {
    const mockExec = {
      id: 'execution-123',
      metisPlugins: [
        {
          pluginStatus: 'FAILED',
          pluginType: 'VALIDATION',
          externalTaskId: 'task-456',
          topologyName: 'validation-topology',
          hasReport: true,
          executionProgress: {
            failRecords: 1,
            failDepublishRecords: 0,
            processedRecords: 10,
            expectedRecords: 10
          }
        }
      ]
    } as any;

    fixture.componentRef.setInput('lastExecutionData', mockExec);
    component.ngOnChanges({ lastExecutionData: { currentValue: mockExec } as any });
    fixture.detectChanges();

    const reportBtn = fixture.debugElement.query(By.css('.report-btn'));
    expect(reportBtn).toBeTruthy();

    spyOn(component.setReportMsg, 'emit');
    reportBtn.triggerEventHandler('click', null);
    expect(component.setReportMsg.emit).toHaveBeenCalled();
  });

  it('should copy information', (): void => {
    spyOn(navigator.clipboard, 'writeText');
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
