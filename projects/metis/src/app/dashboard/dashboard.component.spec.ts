import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Keycloak from 'keycloak-js';
import { createMockPipe, mockedKeycloak } from 'shared';
import { environment } from '../../environments/environment';
import {
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockExecutionsGridComponent,
  MockOngoingExecutionsComponent,
  mockPluginLog,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { PluginExecution, PluginStatus, WorkflowExecution } from '../_models';
import { DatasetsService, WorkflowService } from '../_services';
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
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: ActivatedRoute,
          useValue: {}
        },
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
      component.showPluginLog = mockPluginLog;
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
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should gracefully intercept server failures via the error callback and retain background loop stability', () => {
      const workflowService = TestBed.inject(WorkflowService);
      spyOn(workflowService, 'getAllExecutionsCollectingPages').and.callThrough();

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;

      jasmine.clock().tick(1);

      expect(workflowService.getAllExecutionsCollectingPages).toHaveBeenCalledTimes(1);

      expect(component.runningIsLoading).toBeFalsy();
      expect(component.runningIsFirstLoading).toBeFalsy();

      jasmine.clock().tick(environment.intervalStatus);
      expect(workflowService.getAllExecutionsCollectingPages).toHaveBeenCalledTimes(2);
    });
  });
});
