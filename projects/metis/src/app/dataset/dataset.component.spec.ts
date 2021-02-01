import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NewDatasetComponent } from './newdataset';
import {
  createMockPipe,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockErrorService,
  mockPluginExecution,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import {
  Dataset,
  NotificationType,
  PublicationFitness,
  SimpleReportRequest,
  WorkflowExecution
} from '../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../_services';

import { DatasetComponent } from '.';
import { WorkflowComponent } from './workflow';
import { WorkflowHeaderComponent } from './workflow/workflow-header';

describe('Dataset Component', () => {
  let component: DatasetComponent;
  let datasets: DatasetsService;
  let fixture: ComponentFixture<DatasetComponent>;
  let params: BehaviorSubject<Params>;
  let router: Router;
  let workflows: WorkflowService;
  const interval = 5000;

  const configureTestbed = (errorMode = false): void => {
    params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: './dataset/new', component: NewDatasetComponent }])
      ],
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

    datasets = TestBed.inject(DatasetsService);
    router = TestBed.inject(Router);
    workflows = TestBed.inject(WorkflowService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetComponent);
    component = fixture.componentInstance;
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('responds to form initialisation by setting it in the header', () => {
      component.workflowFormRef = { onHeaderSynchronised: () => undefined } as WorkflowComponent;
      const mockHeader = new WorkflowHeaderComponent();
      mockHeader.elRef = { nativeElement: {} } as ElementRef;
      component.workflowHeaderRef = mockHeader;
      spyOn(component.workflowFormRef, 'onHeaderSynchronised');
      component.formInitialised({} as FormGroup);
      expect(component.workflowFormRef.onHeaderSynchronised).toHaveBeenCalled();
    });

    it('responds to form initialisation by setting it in the header using delays ', fakeAsync(() => {
      component.workflowFormRef = { onHeaderSynchronised: () => undefined } as WorkflowComponent;
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
      tick(1);

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
      tick(1);
      expect(component.reportErrors).toBeTruthy();
      expect(component.reportMsg).toBeFalsy();
    }));

    it('should handle an empty report', fakeAsync(() => {
      spyOn(workflows, 'getReport').and.callFake(() => {
        return of({
          id: '123',
          errors: []
        }).pipe(delay(1));
      });
      expect(component.reportMsg).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as SimpleReportRequest;

      component.setReportMsg(srrE);
      tick(1);
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
      spyOn(workflows, 'startWorkflow').and.callThrough();
      spyOn(window, 'scrollTo');

      component.beginPolling();
      component.loadData();
      component.datasetId = '65';
      component.startWorkflow();
      tick(1);
      expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
      expect(window.scrollTo).toHaveBeenCalled();
      component.cleanup();
      tick(interval);
    }));

    it('should update data periodically and allow polling resets', fakeAsync(() => {
      spyOn(workflows, 'getPublishedHarvestedData').and.callThrough();
      spyOn(workflows, 'getWorkflowForDataset').and.callThrough();

      component.beginPolling();
      component.loadData();

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(index);
        expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(index);
        tick(interval);
      });

      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(6);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(6);
      component.startWorkflow();
      tick(1);
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(7);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(7);

      tick(interval - 1);
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(7);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(7);
      tick(1);
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(8);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(8);

      // it shouldn't drain the event queue when hammered
      component.startWorkflow();
      tick(1);
      component.startWorkflow();
      tick(1);
      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(10);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(10);

      tick(interval);
      tick(interval);

      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(12);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(12);

      tick(interval);

      expect(workflows.getPublishedHarvestedData).toHaveBeenCalledTimes(13);
      expect(workflows.getWorkflowForDataset).toHaveBeenCalledTimes(13);

      component.cleanup();
      tick(interval);
    }));

    it('should put the datasetName in the document title', () => {
      fixture.detectChanges();
      document.title = 'mockedName';
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
      document.title = 'mockedName';

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

      component.cleanup();
      tick(interval);
    }));

    it('should handle setReportMsg errors', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.reportLoading = true;
      component.setReportMsg({ taskId: '123', topology: 'enrichment' });
      tick(1);
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.reportLoading).toBeFalsy();
    }));

    it('should handle startWorkflow errors', fakeAsync(() => {
      spyOn(window, 'scrollTo');
      expect(component.notification).toBeFalsy();
      component.startWorkflow();
      tick(1);
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(window.scrollTo).toHaveBeenCalled();
    }));

    it('should supply the correct publication warnings and classes', fakeAsync(() => {
      const expectedWarning = 'datasetUnpublishableBanner';
      const expectedWarningPartial = 'datasetPartiallyUnpublishableBanner';

      const resultFit = component.publicationFitnessWarningAndClass(PublicationFitness.FIT);
      const resultPartial = component.publicationFitnessWarningAndClass(
        PublicationFitness.PARTIALLY_FIT
      );
      const resultUnfit = component.publicationFitnessWarningAndClass(PublicationFitness.UNFIT);

      expect(resultFit).toBeFalsy();

      expect(resultPartial!.cssClass).toEqual('partial-fitness');
      expect(resultPartial!.warning).toEqual(expectedWarningPartial);

      expect(resultUnfit!.warning).toEqual(expectedWarning);
      expect(resultUnfit!.cssClass).toEqual('unfit-to-publish');
    }));
  });
});
