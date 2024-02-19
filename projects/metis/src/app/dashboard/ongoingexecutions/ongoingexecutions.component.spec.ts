import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  createMockPipe,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService
} from '../../_mocked';

import { PluginExecutionOverview } from '../../_models';

import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { OngoingexecutionsComponent } from '.';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        OngoingexecutionsComponent
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
        {
        provide: RenameWorkflowPipe,
        useValue: createMockPipe('renameWorkflow')
        },
        {
        provide: TranslatePipe,
        useValue: createMockPipe('translate')
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OngoingexecutionsComponent);
    component = fixture.componentInstance;
    workflows = TestBed.inject(WorkflowService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get the plugin status class', () => {
    expect(
      component.getPluginStatusClass(({
        pluginStatus: 'XXX'
      } as unknown) as PluginExecutionOverview)
    ).toEqual('status-xxx');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should calculate the progress', () => {
    expect(component.calcProgress(mockWorkflowExecution)).toBeTruthy();
  });

  it('should show a log', () => {
    spyOn(component.setShowPluginLog, 'emit');
    component.showLog(mockWorkflowExecution);
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should copy information', () => {
    spyOn(navigator.clipboard, 'writeText');
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('should cancel a workflow', () => {
    spyOn(workflows, 'promptCancelThisWorkflow');
    component.cancelWorkflow('', '', '');
    expect(workflows.promptCancelThisWorkflow).not.toHaveBeenCalled();
    component.cancelWorkflow('10', '11', 'The Name');
    expect(workflows.promptCancelThisWorkflow).toHaveBeenCalledWith('10', '11', 'The Name');
  });

  it('should have a tracking function', () => {
    expect(component.byId(10, mockWorkflowExecution)).toBe('253453453');
  });
});
