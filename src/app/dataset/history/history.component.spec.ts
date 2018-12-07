import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  currentDataset,
  currentWorkflow,
  MockDatasetService,
  MockTranslateService,
  MockWorkflowService,
} from '../../_mocked';
import {
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
  WorkflowService,
} from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [HistoryComponent, TranslatePipe, RenameWorkflowPipe],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        RedirectPreviousUrl,
        ErrorService,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    component.datasetData = currentDataset;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a report', () => {
    spyOn(component.setReportRequest, 'emit');
    component.openReport('123', 'mocked');
    fixture.detectChanges();
    expect(component.setReportRequest.emit).toHaveBeenCalledWith({
      taskId: '123',
      topology: 'mocked',
    });
  });

  it('should display history in tabs', () => {
    component.datasetData = currentDataset;
    component.returnAllExecutions();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should load next page', () => {
    component.datasetData = currentDataset;
    component.loadNextPage();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

  it('should update history panel', () => {
    component.lastExecutionData = currentWorkflow.results[4];
    fixture.detectChanges();
    expect(component.allExecutions).toBeTruthy();
  });

  it('should copy something to the clipboard', () => {
    component.copyInformation('plugin', '1', '2');
    expect(component.contentCopied).toBe(true);
  });
});
