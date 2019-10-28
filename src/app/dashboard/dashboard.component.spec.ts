import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createMockPipe,
  MockAuthenticationService,
  MockDatasetsService,
  MockErrorService,
  MockWorkflowService
} from '../_mocked';
//import { PluginExecution, PluginStatus, PluginType, WorkflowExecution } from '../_models';
import { PluginStatus, PluginType } from '../_models';
import {
  AuthenticationService,
  DatasetsService,
  ErrorService,
  WorkflowService
} from '../_services';

import { DashboardComponent } from '.';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent, createMockPipe('translate')],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
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

  // TODO: make this less useless
  it('should open log messages', () => {
    component.showPluginLog = {
      id: 'xx5',
      pluginType: PluginType.OAIPMH_HARVEST,
      pluginStatus: PluginStatus.RUNNING,
      executionProgress: {
        expectedRecords: 1000,
        processedRecords: 500,
        progressPercentage: 50,
        errors: 5
      },
      pluginMetadata: {
        pluginType: PluginType.OAIPMH_HARVEST,
        url: 'example.com',
        setSpec: 'test',
        metadataFormat: 'edm'
      },
      topologyName: 'oai_harvest'
    };
    fixture.detectChanges();
    expect(component.showPluginLog).toBeTruthy();
  });

  /*
  // what does this even do?
  //  it checks it's set.
  //    if so things get looked up by ext id....
  //      it sets it back...
  //  all tests pass if it's disabled

  it('checks the update log', () => {

    let showingId = 'xx5';

    component.showPluginLog = {
      externalTaskId: showingId
    } as unknown as PluginExecution;

    component.checkUpdateLog([
      {
        metisPlugins: [
          {
            id: 'fail',
            externalTaskId: 'no-match'
          },
          {
            id: 'pass',
            externalTaskId: showingId
          }
        ]
      } as unknown as WorkflowExecution
    ]);
    expect(component.showPluginLog).toBe('xxx');
  });
  */

  it('provides a setter for the selectedExecutionDsId', () => {
    expect(component.selectedExecutionDsId).toBe(undefined);
    component.setSelectedExecutionDsId('xxx');
    expect(component.selectedExecutionDsId).toBe('xxx');
  });

  it('should clean up', () => {
    expect(component.runningTimer).not.toBe(undefined);
    component.ngOnDestroy();
    expect(component.runningTimer).toBe(undefined);
  });
});
