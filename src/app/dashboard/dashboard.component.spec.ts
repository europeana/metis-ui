import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { AuthenticationService, DatasetsService, TranslateService, WorkflowService, ErrorService, RedirectPreviousUrl } from '../_services';
import { TranslatePipe } from '../_translate';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockWorkflowService, MockAuthenticationService, MockTranslateService } from '../_mocked';
import { PluginStatus } from '../_models/workflow-execution';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule ],
      declarations: [ DashboardComponent, TranslatePipe ],
      providers: [ { provide: AuthenticationService, useClass: MockAuthenticationService},
        {provide: WorkflowService, useClass: MockWorkflowService},
        DatasetsService,
        ErrorService,
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService }
       ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open log messages', () => {
    component.setShowPluginLog({
      id: 'xx5',
      pluginType: 'import',
      pluginStatus: PluginStatus.RUNNING,
      executionProgress: { expectedRecords: 1000, processedRecords: 500, progressPercentage: 50, errors: 5 },
      pluginMetadata: { pluginType: 'import' },
      topologyName: 'import'
    });
    fixture.detectChanges();
    expect(component.showPluginLog).toBeTruthy();
  });

  it('should open more than 1 page', () => {
    component.getNextPage();
    fixture.detectChanges();
    expect(component.finishedCurrentPage).toBe(1);
  });

  it('should get a list of executions', () => {
    component.finishedCurrentPage = 1;
    component.getFinishedExecutions();
    fixture.detectChanges();
    expect(component.finishedCurrentPage).toBe(1);
  });

});
