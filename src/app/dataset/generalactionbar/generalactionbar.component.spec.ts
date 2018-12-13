import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  createMockPipe,
  currentWorkflow,
  currentWorkflowDataset,
  MockWorkflowService,
} from '../../_mocked';
import { WorkflowStatus } from '../../_models';
import { WorkflowService } from '../../_services';

import { GeneralactionbarComponent } from '.';

describe('GeneralactionbarComponent', () => {
  let component: GeneralactionbarComponent;
  let fixture: ComponentFixture<GeneralactionbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralactionbarComponent, createMockPipe('translate')],
      providers: [{ provide: WorkflowService, useClass: MockWorkflowService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralactionbarComponent);
    component = fixture.componentInstance;
    component.workflowData = currentWorkflowDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check the status', () => {
    component.lastExecutionData = currentWorkflow.results[0];
    expect(component.workflowStatus).toBe(WorkflowStatus.INQUEUE);
  });

  it('should start a workflow', () => {
    component.lastExecutionData = currentWorkflow.results[4];
    expect(component.workflowStatus).toBe(WorkflowStatus.FINISHED);
    fixture.detectChanges();

    spyOn(component.startWorkflow, 'emit');
    const run = fixture.debugElement.query(By.css('app-loading-button'));
    run.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.startWorkflow.emit).toHaveBeenCalledWith();
  });
});
