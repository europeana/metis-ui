import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  MockDatasetsService,
  MockErrorService,
  mockPluginExecution,
  MockWorkflowService
} from '../_mocked';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';

import { DatasetComponent } from '.';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let fixture: ComponentFixture<DatasetComponent>;
  let workflows: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DatasetComponent, createMockPipe('translate')],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
    workflows = TestBed.get(WorkflowService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get dataset info', () => {
    component.loadData();
    fixture.detectChanges();
    expect(component.lastExecutionSubscription.closed).toBe(false);
  });

  it('should switch tabs', () => {
    fixture.detectChanges();

    component.activeTab = 'edit';
    component.datasetIsLoading = component.workflowIsLoading = component.lastExecutionIsLoading = component.harvestIsLoading = false;
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'workflow';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'mapping';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'preview';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();

    component.activeTab = 'log';
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.tabs .active')).length).toBeTruthy();
  });

  it('should be possible to display a message', () => {
    component.showPluginLog = mockPluginExecution;
    fixture.detectChanges();
    expect(component.showPluginLog).toBe(mockPluginExecution);
  });

  it('should start a workflow', () => {
    spyOn(workflows, 'startWorkflow').and.callThrough();
    component.datasetId = '65';
    component.startWorkflow();
    expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
  });
});
