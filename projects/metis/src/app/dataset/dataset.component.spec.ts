import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import Keycloak from 'keycloak-js';

import { createMockPipe, mockedKeycloak } from 'shared';
import { NewDatasetComponent } from './newdataset';
import { environment } from '../../environments/environment';
import {
  MockCountriesService,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  mockPluginExecution,
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import {
  Dataset,
  NotificationType,
  PublicationFitness,
  ReportRequest,
  WorkflowExecution
} from '../_models';
import { CountriesService, DatasetsService, WorkflowService } from '../_services';
import { TranslatePipe, TranslateService } from '../_translate';

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
  const interval = environment.intervalStatusMedium;

  const configureTestbed = (errorMode = false): void => {
    params = new BehaviorSubject({ tab: 'edit', id: '123' } as Params);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: './dataset/new', component: NewDatasetComponent }]),
        DatasetComponent
      ],
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
        {
          provide: CountriesService,
          useClass: MockCountriesService
        },
        { provide: TranslatePipe, useValue: createMockPipe('translate') },
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('responds to form initialisation by setting it in the header', () => {
      const mockWorkflowForm = ({
        onHeaderSynchronised: () => undefined
      } as unknown) as WorkflowComponent;
      spyOn(mockWorkflowForm, 'onHeaderSynchronised');

      (component as any).workflowFormRef = signal(mockWorkflowForm);

      const mockHeader = TestBed.runInInjectionContext(() => new WorkflowHeaderComponent());
      (mockHeader as any).elRef = signal({ nativeElement: {} });
      (component as any).workflowHeaderRef = signal(mockHeader);

      component.formInitialised({} as UntypedFormGroup);
      expect(mockWorkflowForm.onHeaderSynchronised).toHaveBeenCalled();
    });

    it('responds to form initialisation by setting it in the header using delays ', async () => {
      (component as any).workflowFormRef = signal({ onHeaderSynchronised: () => undefined } as any);

      const mockHeader = TestBed.runInInjectionContext(() => new WorkflowHeaderComponent());

      spyOn(component.workflowFormRef()!, 'onHeaderSynchronised');
      component.formInitialised({} as UntypedFormGroup);
      expect(component.workflowFormRef()?.onHeaderSynchronised).not.toHaveBeenCalled();

      (mockHeader as any).elRef = signal({ nativeElement: {} });

      (component as any).workflowHeaderRef = signal(mockHeader);
      expect(component.workflowFormRef()?.onHeaderSynchronised).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 55));

      expect(component.workflowFormRef()?.onHeaderSynchronised).toHaveBeenCalled();
    });

    it('should call setLinkCheck on its workflowFormRef', () => {
      const spy = jasmine.createSpy();

      (component as any).workflowFormRef = signal({ setLinkCheck: spy } as any);
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

    it('should set a report from a message request', async () => {
      component.reportRequest = {};
      expect(component.reportRequest.message).toBeFalsy();

      const srrM = {
        message: 'message'
      } as ReportRequest;

      component.setReportMsg(srrM);
      await Promise.resolve();

      expect(component.reportRequest.errors).toBeFalsy();
      expect(component.reportRequest.message).toBeTruthy();
    });

    it('should set a report from task data', async () => {
      component.reportRequest = {};
      expect(component.reportRequest.message).toBeFalsy();
      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as ReportRequest;

      component.setReportMsg(srrE);
      await new Promise((resolve) => setTimeout(resolve, 5));

      expect(component.reportRequest.errors).toBeTruthy();
      expect(component.reportRequest.message).toBeFalsy();
    });

    it('should handle an empty report', async () => {
      spyOn(workflows, 'getReport').and.callFake(() => {
        return of({
          id: '123',
          errors: []
        }).pipe(delay(1));
      });
      component.reportRequest = {};
      expect(component.reportRequest.message).toBeFalsy();

      const srrE = {
        topology: 'http_harvest',
        taskId: 'taskId'
      } as ReportRequest;

      component.setReportMsg(srrE);
      await new Promise((resolve) => setTimeout(resolve, 5));

      expect(component.reportRequest.message).toEqual('Report is empty.');
    });

    it('should clear the report', () => {
      component.reportRequest = {};
      expect(component.reportRequest.message).toBeFalsy();
      component.setReportMsg({
        message: 'message'
      } as ReportRequest);
      expect(component.reportRequest.message).toBeTruthy();
      component.clearReport();
      expect(component.reportRequest.message).toBeFalsy();
    });

    it('should start a workflow', async () => {
      spyOn(workflows, 'startWorkflow').and.callThrough();
      spyOn(window, 'scrollTo');

      component.beginPolling();
      component.loadData();
      component.datasetId = '65';
      component.startWorkflow();

      await new Promise((resolve) => setTimeout(resolve, 5));

      expect(workflows.startWorkflow).toHaveBeenCalledWith('65');
      expect(window.scrollTo).toHaveBeenCalled();
    });

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

      const mockElementRef = { nativeElement: el } as ElementRef;
      (component as any).scrollToTopAnchor = signal(mockElementRef);

      component.returnToTop();
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle load errors', async () => {
      component.lastExecutionIsLoading = true;
      component.lastExecutionIsLoading = true;

      expect(component.notification).toBeFalsy();
      component.beginPolling();
      component.loadData();

      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.lastExecutionIsLoading).toBeFalsy();
      expect(component.lastExecutionData).toBeFalsy();
      expect(component.lastExecutionIsLoading).toBeFalsy();
    });

    it('should handle setReportMsg errors', async () => {
      expect(component.notification).toBeFalsy();
      component.reportLoading = true;
      component.setReportMsg({ taskId: '123', topology: 'enrichment' });
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(component.reportLoading).toBeFalsy();
    });

    it('should handle startWorkflow errors', async () => {
      spyOn(window, 'scrollTo');
      expect(component.notification).toBeFalsy();
      component.startWorkflow();
      await new Promise((resolve) => setTimeout(resolve, 1));
      expect(component.notification).toBeTruthy();
      expect(component.notification!.type).toBe(NotificationType.ERROR);
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should supply the correct publication warnings and classes', () => {
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
    });
  });
});
