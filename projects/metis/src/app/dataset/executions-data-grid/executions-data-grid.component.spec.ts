import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createMockPipe, MockErrorService, MockWorkflowService } from '../../_mocked';
import { PluginExecution, PluginStatus, PluginType } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

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
    pluginMetadata: {
      pluginType: PluginType.TRANSFORMATION,
      mocked: false,
      enabled: true,
      customXslt: false
    },
    pluginType: PluginType.VALIDATION_EXTERNAL
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        ExecutionsDataGridComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsDataGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a report', () => {
    spyOn(component.setReportMsg, 'emit');
    component.openFailReport('validation', '123');
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: 'validation',
      taskId: '123',
      message: undefined
    });
  });

  it('should open a simple report', () => {
    spyOn(component.setReportMsg, 'emit');
    const msg = 'fail message report';
    component.openFailReport(undefined, undefined, msg);
    fixture.detectChanges();
    expect(component.setReportMsg.emit).toHaveBeenCalledWith({
      topology: undefined,
      taskId: undefined,
      message: 'fail message report'
    });
  });

  it('should copy something to the clipboard', () => {
    component.plugin = basicPluginExecution;
    fixture.detectChanges();
    component.copyInformation('plugin', '1', '2');
    expect(component.contentCopied).toBe(true);
  });
});
