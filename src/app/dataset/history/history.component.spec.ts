import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, RenameWorkflowPipe } from '../../_translate';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset, MockAuthenticationService, MockTranslateService } from '../../_mocked';

import { HistoryComponent } from './history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ HistoryComponent, TranslatePipe, RenameWorkflowPipe ],
      providers: [ DatasetsService,
        {provide: WorkflowService, useClass: MockWorkflowService},
        RedirectPreviousUrl,
        { provide: AuthenticationService, useClass: MockAuthenticationService},
        ErrorService,
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show in collapsable panel', () => {
    component.inCollapsablePanel = true;
    fixture.detectChanges();
    expect(component.totalPages).toBeFalsy();
  });

  it('should show in tab', () => {
    component.inCollapsablePanel = false;
    fixture.detectChanges();
    expect(component.inCollapsablePanel).toBe(false);
  });

  it('should open a report', () => {
    component.datasetData = currentDataset;
    fixture.detectChanges();

    component.openReport('123', 'mocked');
    fixture.detectChanges();
    expect(component.report).toBeTruthy();
  });

  it('should display history in panel', () => {
    component.datasetData = currentDataset;
    component.inCollapsablePanel = true;
    component.returnAllExecutions();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should display history in tabs', () => {
    component.datasetData = currentDataset;
    component.inCollapsablePanel = false;
    component.returnAllExecutions();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should load next page', () => {
    component.datasetData = currentDataset;
    component.inCollapsablePanel = false;
    component.nextPage = 1;
    component.loadNextPage();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should run a workflow', () => {
    component.datasetData = currentDataset;
    component.triggerWorkflow();
    fixture.detectChanges();
    expect(component.workflowHasFinished).toBe(false);
  });

  it('should update history panel', () => {
    component.updateExecutionHistoryPanel(currentWorkflow.results[4]);
    fixture.detectChanges();
    expect(component.historyInPanel).toBeTruthy();
  });

  it('should copy something to the clipboard', () => {
    component.copyInformation('plugin', '1', '2');
    expect(component.contentCopied).toBe(true);
  });

  it('should get the last execution', () => {
    component.datasetData = currentDataset;
    component.lastExecutionData = currentWorkflow['results'][4];
    component.getLatestExecution();
    fixture.detectChanges();
    expect(component.workflowHasFinished).toBe(true);
  });
});
