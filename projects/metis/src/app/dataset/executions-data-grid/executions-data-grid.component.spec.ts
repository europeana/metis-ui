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
    pluginType: PluginType.TRANSFORMATION
  };

  const OAIPMHPluginExecution = Object.assign({}, basicPluginExecution);
  OAIPMHPluginExecution.pluginType = PluginType.OAIPMH_HARVEST;

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
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsDataGridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the highlight when the PluginExecution is set ', () => {
    component.pluginExecution = basicPluginExecution;
    expect(component.applyHighlight).toBeFalsy();

    const runningExecution = Object.assign({}, basicPluginExecution);
    runningExecution.pluginStatus = PluginStatus.RUNNING;
    component.pluginExecution = runningExecution;
    expect(component.applyHighlight).toBeTruthy();
  });

  it('should detect if plugin is harvest', () => {
    expect(component.pluginIsHarvest(basicPluginExecution)).toBeFalsy();
    expect(component.pluginIsHarvest(OAIPMHPluginExecution)).toBeTruthy();
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
    component.copyInformation('1', '2');
    expect(component.contentCopied).toBe(true);
    component.contentCopied = false;
    component.copyInformation('1');
    expect(component.contentCopied).toBe(true);
  });

  it('should go to the preview', () => {
    spyOn(component.openPreview, 'emit');
    component.goToPreview('1', basicPluginExecution);
    expect(component.openPreview.emit).toHaveBeenCalled();
  });
});
