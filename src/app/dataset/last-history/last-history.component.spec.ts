import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, RenameWorkflowPipe } from '../../_translate';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset, MockAuthenticationService, MockTranslateService } from '../../_mocked';

import { LastHistoryComponent } from './last-history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: LastHistoryComponent;
  let fixture: ComponentFixture<LastHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ LastHistoryComponent, TranslatePipe, RenameWorkflowPipe ],
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
    fixture = TestBed.createComponent(LastHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open a report', () => {
    component.openReport('123', 'mocked');
    fixture.detectChanges();
    expect(component.report).toBeTruthy();
  });

  it('should display history in panel', () => {
    component.lastExecutionData = currentWorkflow.results[4];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

});
