import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import {
  MockDatasetsService,
  MockDatasetsServiceErrors,
  mockWorkflowExecutionResults,
  MockWorkflowService,
  MockWorkflowServiceErrors
} from '../_mocked';
import { PluginExecution, PluginType } from '../_models';

import { DatasetsService, WorkflowService } from '../_services';
import { SampleResource } from '.';

describe('Sample Resource', () => {
  let resource: SampleResource;
  let workflowService: WorkflowService;

  const b4Each = async (errorMode = false): Promise<void> => {
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

    await Promise.resolve();
  };

  describe('Normal Operations', () => {
    beforeEach(async () => {
      await b4Each();
    });

    it('should create', () => {
      expect(resource).toBeTruthy();
    });

    it('should compute the transformableExecution', async () => {
      TestBed.flushEffects();
      await Promise.resolve();

      expect(resource.transformationUnavailable()).toBeTruthy();

      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();
      await Promise.resolve();

      expect(resource.transformationUnavailable()).toBeFalsy();

      resource.datasetId.set(undefined);

      TestBed.flushEffects();
      await Promise.resolve();

      expect(resource.transformationUnavailable()).toBeTruthy();
    });

    it('should get the transformed samples', async () => {
      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callThrough();
      spyOn(workflowService, 'getWorkflowSamples').and.callThrough();

      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();
      await Promise.resolve();

      expect(workflowService.getFinishedDatasetExecutions).toHaveBeenCalled();
      expect(workflowService.getWorkflowSamples).toHaveBeenCalled();

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();

      await new Promise((resolve) => setTimeout(resolve, 15));
      TestBed.flushEffects();
      await Promise.resolve();

      expect(resource.originalSamples.value()?.length).toBeTruthy();
      expect(resource.transformedSamples.value()?.length).toBeTruthy();

      resource.datasetId.set(undefined);
      TestBed.flushEffects();
      await Promise.resolve();

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();
    });

    it('should not get the transformed samples if there is no VALIDATION_EXTERNAL plugin', async () => {
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
      await Promise.resolve();

      expect(workflowService.getFinishedDatasetExecutions).toHaveBeenCalled();
      expect(workflowService.getWorkflowSamples).not.toHaveBeenCalled();

      expect(resource.originalSamples.value()?.length).toBeFalsy();
      expect(resource.transformedSamples.value()?.length).toBeFalsy();
      expect(resource.transformationUnavailable()).toBeTruthy();
    });
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

    beforeEach(async () => {
      await b4Each(true);
    });

    it('should handle http errors with getFinishedDatasetExecutions', async () => {
      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 15));
      TestBed.flushEffects();
      await Promise.resolve();

      expectEmptyResource();
      excpectHttpError(404, 'Error: getFinishedDatasetExecutions');
    });

    it('should handle http errors with getWorkflowSamples', async () => {
      spyOn(workflowService, 'getFinishedDatasetExecutions').and.callFake(() => {
        return of(mockWorkflowExecutionResults);
      });
      resource.xslt.set('default');
      resource.datasetId.set('1');

      TestBed.flushEffects();
      await new Promise((resolve) => setTimeout(resolve, 15));
      TestBed.flushEffects();
      await Promise.resolve();

      expectEmptyResource();
      excpectHttpError(500, 'Error: getWorkflowSamples');
    });
  });
});
