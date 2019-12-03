import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import {
  createMockPipe,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockErrorService,
  mockPluginExecution,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { Dataset, NotificationType, SimpleReportRequest, WorkflowExecution } from '../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';

import { DatasetComponent } from '.';
import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

describe('DatasetComponent', () => {
  let component: DatasetComponent;
  let datasets: DatasetsService;
  let fixture: ComponentFixture<DatasetComponent>;
  let params: BehaviorSubject<Params>;
  let router: Router;
  let workflows: WorkflowService;

  const configureTestbed = (errorMode = false): void => {
    params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [DatasetComponent, createMockPipe('translate')],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: params }
        },
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

    datasets = TestBed.get(DatasetsService);
    router = TestBed.get(Router);
    workflows = TestBed.get(WorkflowService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
  };

  describe('Normal operation', () => {
    beforeEach(async(() => {
      configureTestbed();
    }));

    beforeEach(b4Each);

    it('responds to form initialisation by setting it in the header', () => {
      component.workflowFormRef = { onHeaderSynchronised: () => {} } as WorkflowComponent;
      const mockHeader = new WorkflowHeaderComponent();
      mockHeader.elRef = { nativeElement: {} } as ElementRef;
      component.workflowHeaderRef = mockHeader;
      spyOn(component.workflowFormRef, 'onHeaderSynchronised');
      component.formInitialised({} as FormGroup);
      expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
    });

    it('responds to form initialisation by setting it in the header using delays ', fakeAsync(() => {
      component.workflowFormRef = { onHeaderSynchronised: () => {} } as WorkflowComponent;
      const mockHeader = new WorkflowHeaderComponent();
      spyOn(component.workflowFormRef, 'onHeaderSynchronised');
      component.formInitialised({} as FormGroup);
      expect(component.workflowFormRef.onHeaderSynchronised).not.toHaveBeenCalled();
      mockHeader.elRef = { nativeElement: {} } as ElementRef;
      component.workflowHeaderRef = mockHeader;
      expect(component.workflowFormRef.onHeaderSynchronised).not.toHaveBeenCalled();
      tick(50);
      expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
    }));

    it('should call setLinkCheck on its workflowFormRef', () => {
      const spy = jasmine.createSpy();
      component.workflowFormRef = ({ setLinkCheck: spy } as unknown) as WorkflowComponent;
      component.setLinkCheck(1);
      expect(spy).toHaveBeenCalled();
    });

    it('should regulate the polling for data', fakeAsync(() => {
      spyOn(workflows, 'getPublishedHarvestedData');

      component.beginPolling();
      tick();
      component.loadData();
      tick();
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(1);

      component.pollingRefresh.next(true);
      tick(1000);
      fixture.detectChanges();
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(2);
      component.unsubscribe([
        component.harvestSubscription,
        component.workflowSubscription,
        component.lastExecutionSubscription
      ]);
      tick(5000);
    }));

    it('should get dataset info', () => {
      expect(component.lastExecutionSubscription).toBeFalsy();
      component.beginPolling();
      component.loadData();
      fixture.detectChanges();
      expect(component.lastExecutionSubscription).toBeTruthy();
      expect(component.lastExecutionSubscription.closed).toBe(false);
    });

    it('should set isStarting to false if the workflow is completed', () => {
      component.isStarting = true;
      component.processLastExecutionData({} as WorkflowExecution);
      expect(component.isStarting).toBe(false);
    });

    it('should switch tabs', () => {
      ['edit', 'log', 'mapping', 'preview', 'workflow'].forEach((tabName) => {
        params.next({ tab: tabName, id: '123' } as Params);
        fixture.detectChanges();
        expect(component.activeTab).toEqual(tabName);
      });
    });

    it('should redirect new datasets', () => {
      spyOn(router, 'navigate');
      params.next({ tab: 'new' } as Params);
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should be possible to display a message', () => {
      component.showPluginLog = mockPluginExecution;
      fixture.detectChanges();
      expect(component.showPluginLog).toBe(mockPluginExecution);
    });

    it('should set a report from a message request', fakeAsync(() => {
      expect(component.reportMsg).toBeFalsy();
      expect(component.reportMsg).toBeFalsy();

      const srrM = {
        message: 'message'
      } as SimpleReportRequest;

      component.setReportMsg(srrM);
      tick();

      expect(component.reportErrors).toBeFalsy();
      expect(component.reportMsg).toBeTruthy();
    }));

    it('should set a report from task data', fakeAsync(() => {
      expect(component.reportMsg).toBeFalsy();
      expect(component.reportMsg).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as SimpleReportRequest;

      component.setReportMsg(srrE);
      tick();
      expect(component.reportErrors).toBeTruthy();
      expect(component.reportMsg).toBeFalsy();
    }));

    it('should handle an empty report', fakeAsync(() => {
      spyOn(workflows, 'getReport').and.callFake(() => {
        return of({
          id: 123,
          errors: []
        });
      });
      expect(component.reportMsg).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as SimpleReportRequest;

      component.setReportMsg(srrE);
      tick();
      expect(component.reportMsg).toEqual('Report is empty.');
    }));

    it('should clear the report message', () => {
      expect(component.reportMsg).toBeFalsy();
      component.setReportMsg({
        message: 'message'
      } as SimpleReportRequest);
      expect(component.reportMsg).toBeTruthy();
      component.clearReport();
      expect(component.reportMsg).toBeFalsy();
    });

    it('should start a workflow', fakeAsync(() => {
      component.beginPolling();
      spyOn(workflows, 'startWorkflow').and.callThrough();
      spyOn(component.pollingRefresh, 'next');
      spyOn(window, 'scrollTo');
      component.datasetId = '65';
      component.startWorkflow();
      tick();
      expect(component.pollingRefresh.next).toHaveBeenCalled();
      expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
      expect(window.scrollTo).toHaveBeenCalled();
    }));

    it('should update data', () => {
      spyOn(component, 'loadData');
      component.datasetUpdated();
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should put the datasetName in the document title', () => {
      fixture.detectChanges();
      expect(document.title).toContain('mockedName');
      expect(document.title).not.toContain('x');

      spyOn(datasets, 'getDataset').and.callFake(() => {
        return of({ datasetName: 'x' } as Dataset);
      });

      component.loadData();
      fixture.detectChanges();
      expect(document.title).not.toContain('mockedName');
      expect(document.title).toContain('x');
    });

    it('should provide a default document title', () => {
      fixture.detectChanges();
      expect(document.title).toContain('mockedName');

      spyOn(datasets, 'getDataset').and.callFake(() => {
        return of({} as Dataset);
      });
      component.loadData();
      fixture.detectChanges();
      expect(document.title).toContain('Dataset');
    });

    it('should return to the top', () => {
      const mockFn = jasmine.createSpy();
      const el = ({ scrollIntoView: mockFn } as unknown) as Element;
      component.scrollToTopAnchor = { nativeElement: el } as ElementRef;
      component.returnToTop();
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));
    beforeEach(b4Each);

    it('should handle load errors', fakeAsync(() => {
      component.lastExecutionIsLoading = true;
      component.lastExecutionIsLoading = true;

      expect(component.notification).toBeFalsy();
      component.beginPolling();
      component.loadData();
      tick();

      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.lastExecutionIsLoading).toBeFalsy();
      expect(component.lastExecutionData).toBeFalsy();
      expect(component.lastExecutionIsLoading).toBeFalsy();
    }));

    it('should handle setReportMsg errors', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.reportLoading = true;
      component.setReportMsg({ taskId: '123', topology: 'enrichment' });
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.reportLoading).toBeFalsy();
    }));

    it('should handle startWorkflow errors', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      expect(component.notification).toBeFalsy();
      component.startWorkflow();
      tick();
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(window.scrollTo).toHaveBeenCalled();
    }));
  });
});
