import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, mockWorkflowExecution } from '../../_mocked';
import { PluginExecution, PluginStatus, WorkflowStatus } from '../../_models';

import { LastExecutionComponent } from '.';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        LastExecutionComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getPluginExecution = (status: PluginStatus): PluginExecution => {
    return ({
      pluginStatus: status,
      executionProgress: { errors: 0 }
    } as unknown) as PluginExecution;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should find the last execution in the workflow', () => {
    expect(component.currentPlugin).toBeFalsy();
    component.lastExecutionData = mockWorkflowExecution;
    expect(component.currentPlugin).toBeTruthy();
  });

  it('should not find the last execution in an empty workflow', () => {
    expect(component.currentPlugin).toBeFalsy();
    component.lastExecutionData = undefined;
    expect(component.currentPlugin).toBeFalsy();
  });

  it('should not find the last execution in a completed workflow', () => {
    const mockWorkflowExecutionFinished = Object.assign(
      { ...mockWorkflowExecution },
      { workflowStatus: WorkflowStatus.FINISHED }
    );
    expect(component.currentPlugin).toBeFalsy();
    component.lastExecutionData = mockWorkflowExecutionFinished;
    expect(component.currentPlugin).toBeFalsy();
  });

  it('should scroll', () => {
    const mockFn = jasmine.createSpy();
    const el = ({ scrollIntoView: mockFn } as unknown) as Element;
    component.scroll(el);
    expect(mockFn).toHaveBeenCalled();
  });

  it('should get if the plugin is hightlighted', () => {
    expect(1).toEqual(1);
    expect(component.getPluginHighlighted(getPluginExecution(PluginStatus.RUNNING))).toBeTruthy();
    expect(component.getPluginHighlighted(getPluginExecution(PluginStatus.FINISHED))).toBeFalsy();
  });

  it('should get the plugin status', () => {
    expect(component.getPluginStatusClass(getPluginExecution(PluginStatus.FINISHED))).toEqual(
      'status-finished'
    );
  });

  it('should open a simple report', () => {
    spyOn(component.setReportMsg, 'emit');
    component.openFailReport({});
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalled();
  });
});
