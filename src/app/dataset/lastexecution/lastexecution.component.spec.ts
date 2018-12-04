import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { TranslatePipe, RenameWorkflowPipe } from '../../_translate';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';
import { MockWorkflowService, currentWorkflow, currentDataset, MockAuthenticationService, MockTranslateService } from '../../_mocked';

import { LastExecutionComponent } from './lastexecution.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LastExecutionComponent', () => {
  let component: LastExecutionComponent;
  let fixture: ComponentFixture<LastExecutionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ LastExecutionComponent, TranslatePipe, RenameWorkflowPipe ],
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
    expect(component.setReportRequest.emit).toHaveBeenCalledWith({ taskId: '123', topology: 'mocked' });
  });

  it('should display history in panel', () => {
    component.lastExecutionData = currentWorkflow.results[4];
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.history-table tbody tr')).length).toBeTruthy();
  });

});
