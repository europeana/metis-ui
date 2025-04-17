import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { MockTranslateService, MockWorkflowService } from '../../_mocked';
import { PluginExecution, PluginStatus, PluginType, ThrottleLevel } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { ExecutionsDataGridComponent } from '.';

describe('ExecutionsDataGridComponent', () => {
  let component: ExecutionsDataGridComponent;
  let fixture: ComponentFixture<ExecutionsDataGridComponent>;
  const basicPluginExecution: PluginExecution = {
    id: '1',
    pluginStatus: PluginStatus.FINISHED,
    failMessage: 'failed',
    hasReport: true,
    topologyName: 'validation',
    pluginType: PluginType.TRANSFORMATION
  };

  const OAIPMHPluginExecution = structuredClone(basicPluginExecution);
  OAIPMHPluginExecution.pluginType = PluginType.OAIPMH_HARVEST;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ExecutionsDataGridComponent],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ExecutionsDataGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the highlight when the PluginExecution is RUNNING', () => {
    component.plugin = basicPluginExecution;
    expect(component.applyHighlight).toBeFalsy();

    const runningExecution = {
      ...basicPluginExecution,
      pluginStatus: PluginStatus.RUNNING
    };
    component.plugin = runningExecution;
    expect(component.applyHighlight).toBeTruthy();

    runningExecution.pluginStatus = PluginStatus.FINISHED;
    component.plugin = runningExecution;
    expect(component.applyHighlight).toBeFalsy();
  });

  it('should detect if plugin is harvest', () => {
    expect(component.pluginIsHarvest(basicPluginExecution)).toBeFalsy();
    expect(component.pluginIsHarvest(OAIPMHPluginExecution)).toBeTruthy();
  });

  it('should getPluginMediaMetadata', () => {
    const mediaPluginExecution = structuredClone(basicPluginExecution);
    mediaPluginExecution.pluginMetadata = {
      pluginType: PluginType.MEDIA_PROCESS,
      throttlingLevel: ThrottleLevel.WEAK
    };
    expect(component.getPluginMediaMetadata(basicPluginExecution)).toBeFalsy();
    expect(component.getPluginMediaMetadata(mediaPluginExecution)).toBeFalsy();
    mediaPluginExecution.pluginType = PluginType.MEDIA_PROCESS;
    expect(component.getPluginMediaMetadata(mediaPluginExecution)).toBeTruthy();
  });

  it('should open a report', () => {
    spyOn(component.setReportMsg, 'emit');
    component.plugin = basicPluginExecution;
    component.openFailReport('validation', '123');
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: 'validation',
      taskId: '123',
      message: undefined,
      workflowExecutionId: undefined,
      pluginType: component.plugin.pluginType
    });
  });

  it('should open a simple report', () => {
    spyOn(component.setReportMsg, 'emit');
    const msg = 'fail message report';
    component.plugin = basicPluginExecution;
    component.openFailReport(undefined, undefined, msg);
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: undefined,
      taskId: undefined,
      workflowExecutionId: undefined,
      pluginType: component.plugin.pluginType,
      message: 'fail message report'
    });
  });

  it('should copy something to the clipboard', () => {
    spyOn(navigator.clipboard, 'writeText');
    component.plugin = basicPluginExecution;
    component.copyInformation('1', '2');
    expect(component.contentCopied).toBe(true);
    component.contentCopied = false;
    component.copyInformation('1');
    expect(component.contentCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('should go to the preview', () => {
    spyOn(component.openPreview, 'emit');
    component.goToPreview('1', basicPluginExecution);
    expect(component.openPreview.emit).toHaveBeenCalled();
  });
});
