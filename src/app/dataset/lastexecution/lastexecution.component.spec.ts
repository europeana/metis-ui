import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
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

import { LastExecutionComponent } from '.';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [LastExecutionComponent, TranslatePipe, RenameWorkflowPipe],
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
    fixture = TestBed.createComponent(LastExecutionComponent);
    component = fixture.componentInstance;
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

  it('should display history in panel', () => {
    component.lastExecutionData = currentWorkflow.results[4];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });
});
