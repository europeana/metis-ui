import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  createMockPipe,
  MockAuthenticationService,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockErrorService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { PluginExecution, PluginStatus, PluginType, WorkflowExecution } from '../_models';
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

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent, createMockPipe('translate')],
      providers: [
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

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

    it('checks the update log', () => {
      const showingId = 'xx5';

      component.showPluginLog = ({
        externalTaskId: showingId
      } as unknown) as PluginExecution;

      const updatedPlugin = ({
        id: 'pass',
        externalTaskId: showingId
      } as unknown) as PluginExecution;

      component.checkUpdateLog([
        ({
          metisPlugins: [
            {
              id: 'fail',
              externalTaskId: 'no-match',
              pluginStatus: PluginStatus.FINISHED
            },
            updatedPlugin
          ]
        } as unknown) as WorkflowExecution
      ]);
      expect(component.showPluginLog).toBe(updatedPlugin);
    });

    it('provides a setter for the selectedExecutionDsId', () => {
      expect(component.selectedExecutionDsId).toBe(undefined);
      component.setSelectedExecutionDsId('xxx');
      expect(component.selectedExecutionDsId).toBe('xxx');
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should handle load errors', fakeAsync(() => {
      component.runningIsLoading = true;
      component.runningIsFirstLoading = true;
      component.getRunningExecutions();
      tick();
      expect(component.runningIsLoading).toBeFalsy();
      expect(component.runningIsFirstLoading).toBeFalsy();
    }));
  });
});
