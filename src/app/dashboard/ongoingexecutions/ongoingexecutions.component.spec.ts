import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createMockPipe,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService
} from '../../_mocked';

import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { OngoingexecutionsComponent } from '.';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OngoingexecutionsComponent,
        createMockPipe('renameWorkflow'),
        createMockPipe('translate')
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

  it('should show a log', () => {
    spyOn(component.setShowPluginLog, 'emit');
    component.showLog(mockWorkflowExecution);
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
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
