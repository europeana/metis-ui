import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  MockAuthenticationService,
  MockDatasetService,
  MockErrorService,
  MockWorkflowService,
} from '../_mocked';
import { PluginStatus } from '../_models';
import {
  AuthenticationService,
  DatasetsService,
  ErrorService,
  WorkflowService,
} from '../_services';

import { DashboardComponent } from '.';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule],
      declarations: [DashboardComponent, createMockPipe('translate')],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
    component.showPluginLog = {
      id: 'xx5',
      pluginType: 'import',
      pluginStatus: PluginStatus.RUNNING,
      executionProgress: {
        expectedRecords: 1000,
        processedRecords: 500,
        progressPercentage: 50,
        errors: 5,
      },
      pluginMetadata: { pluginType: 'import' },
      topologyName: 'import',
    };
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
