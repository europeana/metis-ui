import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import {
  createMockPipe,
  MockAuthenticationService,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockExecutionsGridComponent,
  MockOngoingExecutionsComponent,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { PluginExecution, PluginStatus, PluginType, WorkflowExecution } from '../_models';
import { AuthenticationService, DatasetsService, WorkflowService } from '../_services';
import { TranslatePipe, TranslateService } from '../_translate';
import { ExecutionsGridComponent } from './executionsgrid';
import { OngoingExecutionsComponent } from './ongoingexecutions';
import { DashboardComponent } from '.';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent, ExecutionsGridComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        { provide: TranslateService, useClass: MockTranslateService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(DashboardComponent, {
        remove: { imports: [ExecutionsGridComponent, OngoingExecutionsComponent] },
        add: { imports: [MockExecutionsGridComponent, MockOngoingExecutionsComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

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
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle load errors', fakeAsync(() => {
      component.runningIsLoading = true;
      component.runningIsFirstLoading = true;
      component.getRunningExecutions();
      tick(environment.intervalStatusMedium);
      expect(component.runningIsLoading).toBeFalsy();
      expect(component.runningIsFirstLoading).toBeFalsy();
    }));
  });
});
