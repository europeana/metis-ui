import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { MockTranslateService, mockWorkflowExecution } from '../../_mocked';
import { PluginExecution, PluginStatus, WorkflowStatus } from '../../_models';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { LastExecutionComponent } from '.';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, LastExecutionComponent],
      providers: [
        {
          provide: TranslateService,
          useClass: MockTranslateService
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: RenameWorkflowPipe,
          useValue: createMockPipe('renameWorkflow')
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
    const mockWorkflowExecutionFinished = {
      ...mockWorkflowExecution,
      workflowStatus: WorkflowStatus.FINISHED
    };
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
