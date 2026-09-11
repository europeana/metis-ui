import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
    fixture.componentRef.setInput('plugin', basicPluginExecution);
    fixture.detectChanges();
  });

  it('should create', () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should apply the highlight when the PluginExecution is RUNNING', () => {
    fixture.componentRef.setInput('plugin', basicPluginExecution);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.applyHighlight()).toBeFalse();

    const runningExecution = {
      ...basicPluginExecution,
      pluginStatus: PluginStatus.RUNNING
    };
    fixture.componentRef.setInput('plugin', runningExecution);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.applyHighlight()).toBeTrue();

    const finishedExecution = {
      ...runningExecution,
      pluginStatus: PluginStatus.FINISHED
    };
    fixture.componentRef.setInput('plugin', finishedExecution);
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.applyHighlight()).toBeFalse();
  });

  it('should detect if plugin is harvest', () => {
    expect(component.pluginIsHarvest(basicPluginExecution)).toBeFalse();
    expect(component.pluginIsHarvest(OAIPMHPluginExecution)).toBeTrue();
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
    fixture.componentRef.setInput('plugin', basicPluginExecution);
    TestBed.flushEffects();
    fixture.detectChanges();

    component.openFailReport('validation', '123');
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: 'validation',
      taskId: '123',
      message: undefined,
      workflowExecutionId: undefined,
      pluginType: component.plugin().pluginType
    });
  });

  it('should open a simple report', () => {
    spyOn(component.setReportMsg, 'emit');
    const msg = 'fail message report';
    fixture.componentRef.setInput('plugin', basicPluginExecution);
    TestBed.flushEffects();
    fixture.detectChanges();

    component.openFailReport(undefined, undefined, msg);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: undefined,
      taskId: undefined,
      workflowExecutionId: undefined,
      pluginType: component.plugin().pluginType,
      message: 'fail message report'
    });
  });

  it('should copy something to the clipboard', () => {
    spyOn(navigator.clipboard, 'writeText');
    fixture.componentRef.setInput('plugin', basicPluginExecution);
    TestBed.flushEffects();
    fixture.detectChanges();

    component.copyInformation('1', '2');
    expect(component.contentCopied()).toBeTrue();

    component.contentCopied.set(false);
    component.copyInformation('1');
    expect(component.contentCopied()).toBeTrue();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('should go to the preview', () => {
    spyOn(component.openPreview, 'emit');
    component.goToPreview('1', basicPluginExecution);
    expect(component.openPreview.emit).toHaveBeenCalled();
  });

  it('should resolve depublication reason from an object structure', () => {
    const mockReasonObject = {
      valueAsString: 'Dataset requested for removal by admin',
      name: 'Administrative Removal'
    };

    const depubMetadata = {
      depublicationReason: mockReasonObject
    };

    expect(component.getDepublicationReasonText(depubMetadata as any)).toEqual(
      'Dataset requested for removal by admin'
    );
  });

  it('should fall back to name field if valueAsString is empty on object structures', () => {
    const mockReasonObjectNoValue = {
      valueAsString: '',
      name: 'Fallback Administrative Title'
    };

    const depubMetadata = {
      depublicationReason: mockReasonObjectNoValue
    };

    expect(component.getDepublicationReasonText(depubMetadata as any)).toEqual(
      'Fallback Administrative Title'
    );
  });

  it('should return undefined if metadata or depublication reason is completely missing', () => {
    expect(component.getDepublicationReasonText(undefined)).toBeUndefined();
    expect(component.getDepublicationReasonText({} as any)).toBeUndefined();
  });
});
