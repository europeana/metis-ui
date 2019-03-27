import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createMockPipe,
  mockPluginExecution,
  MockTranslateService,
  mockWorkflowExecution,
  MockWorkflowService,
} from '../../../_mocked';
import { WorkflowService } from '../../../_services';
import { TranslateService } from '../../../_translate';

import { ExecutiontableComponent } from '.';

describe('ExecutiontableComponent', () => {
  let component: ExecutiontableComponent;
  let fixture: ComponentFixture<ExecutiontableComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutiontableComponent, createMockPipe('translate')],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    workflows = TestBed.get(WorkflowService);
    fixture = TestBed.createComponent(ExecutiontableComponent);
    component = fixture.componentInstance;
    component.execution = mockWorkflowExecution;
    component.plugin = mockPluginExecution;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
