import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  MockDatasetsService,
  MockDatasetsServiceErrors,
  mockWorkflowExecutionResults,
  MockWorkflowService,
  MockWorkflowServiceErrors,
  mockXmlSamples
} from '../_mocked';
import { PluginExecution, PluginType } from '../_models';

import { DatasetsService, WorkflowService } from '../_services';
import { SampleResource } from '.';

fdescribe('Sample Resource', () => {
  let resource: SampleResource;
  let workflowService: WorkflowService;

  const b4Each = (errorMode = false): void => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        }
      ]
    }).compileComponents();
    resource = TestBed.inject(SampleResource);
    workflowService = TestBed.inject(WorkflowService);
    //datasetService = TestBed.inject(SampleService);
    TestBed.flushEffects();
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      b4Each();
    });

    it('should create', () => {
      expect(resource).toBeTruthy();
    });

    it('should get the transformed samples', fakeAsync(() => {
      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callThrough();
      spyOn(workflowService, 'getWorkflowSamples').and.callThrough();

      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();

      expect(workflowService.getFinishedDatasetExecutions).toHaveBeenCalled();
      expect(workflowService.getWorkflowSamples).toHaveBeenCalled();

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();

      tick(1);
      TestBed.flushEffects();
      tick(1);

      expect(resource.originalSamples.value()?.length).toBeTruthy();
      expect(resource.transformedSamples.value()?.length).toBeTruthy();

      // delete
      resource.datasetId.set(undefined);
      TestBed.flushEffects();

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();
    }));

    it('should not get the transformed samples if there is no VALIDATION_EXTERNAL plugin', fakeAsync(() => {
      const copyResult = structuredClone(mockWorkflowExecutionResults);

      copyResult.results[0].metisPlugins = copyResult.results[0].metisPlugins.filter(
        (pe: PluginExecution) => {
          return pe.pluginType !== PluginType.VALIDATION_EXTERNAL;
        }
      );

      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callFake(() => {
        return of(copyResult);
      });
      spyOn(workflowService, 'getWorkflowSamples').and.callThrough();

      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();

      expect(workflowService.getFinishedDatasetExecutions).toHaveBeenCalled();
      expect(workflowService.getWorkflowSamples).not.toHaveBeenCalled();

      tick(1);
      TestBed.flushEffects();
      tick(1);

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();
    }));
  });

  describe('Error Handling', () => {
    const expectEmptyResource = (): void => {
      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();
    };

    const excpectHttpError = (code: number, statusText: string): void => {
      const httpError = resource.httpError() as HttpErrorResponse;
      expect(httpError).toBeTruthy();
      if (httpError) {
        expect(httpError.status).toEqual(code);
        expect(httpError.statusText).toEqual(statusText);
      }
    };

    const processChanges = (): void => {
      TestBed.flushEffects();
      tick(1);
      TestBed.flushEffects();
      tick(1);
    };

    beforeEach(() => {
      b4Each(true);
    });

    it('should handle http errors with getFinishedDatasetExecutions', fakeAsync(() => {
      resource.xslt.set('default');
      resource.datasetId.set('1');
      processChanges();
      expectEmptyResource();
      excpectHttpError(404, 'Error: getFinishedDatasetExecutions');
    }));

    it('should handle http errors with getWorkflowSamples', fakeAsync(() => {
      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callFake(() => {
        return of(mockWorkflowExecutionResults);
      });
      resource.xslt.set('default');
      resource.datasetId.set('1');
      processChanges();
      expectEmptyResource();
      excpectHttpError(500, 'Error: getWorkflowSamples');
    }));

    it('should handle http errors with XXX', fakeAsync(() => {
      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callFake(() => {
        return of(mockWorkflowExecutionResults);
      });
      spyOn(workflowService, 'getWorkflowSamples').and.callFake(() => {
        return of(mockXmlSamples);
      });
      resource.xslt.set('default');
      resource.datasetId.set('1');
      processChanges();
      excpectHttpError(501, 'Error: getTransform');
    }));
  });
});
