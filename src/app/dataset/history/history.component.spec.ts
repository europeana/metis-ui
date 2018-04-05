import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

import { HistoryComponent } from './history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let spy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ HistoryComponent, TranslatePipe ],
      providers: [ DatasetsService,    
        {provide: WorkflowService, useClass: MockWorkflowService},     
        RedirectPreviousUrl, 
        AuthenticationService, 
        ErrorService,
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        }],
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
  });

  it('should show in tab', () => {
    component.inCollapsablePanel = false;
    fixture.detectChanges();
  });

  it('should open workflow filter', (): void => {   
    const workflow = fixture.debugElement.query(By.css('.dropdown a'));
    workflow.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).toBeTruthy();

    component.allWorkflows = ['mocked'];
    const filter = fixture.debugElement.query(By.css('.dropdown ul a'));
    filter.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).not.toBeTruthy();

    component.onClickedOutside();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).not.toBeTruthy();
  });
  
  it('should open a report', () => {
    component.datasetData = currentDataset;
    fixture.detectChanges(); 

    component.openReport(123, 'mocked');
    fixture.detectChanges();
    expect(component.report).not.toBe('');
  });
  
  it('should display history in panel', () => {
    component.datasetData = currentDataset;
    component.selectedFilterWorkflow = 'mocked';
    component.inCollapsablePanel = true;
    component.returnAllExecutions();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should display history in tabs', () => {
    component.datasetData = currentDataset;
    component.selectedFilterWorkflow = 'mocked';
    component.inCollapsablePanel = false;
    component.returnAllExecutions();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should load next page', () => {
    component.datasetData = currentDataset;
    component.selectedFilterWorkflow = 'mocked';
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
    expect(component.workflowRunning).toBe(true);
  });

});

