import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, toArray } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import {
  mockDatasetOverviewResults,
  MockDatasetsService,
  mockFirstPageResults,
  mockHarvestData,
  mockHistoryVersion,
  mockReport,
  mockReportAvailability,
  mockStatistics,
  mockStatisticsDetail,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionHistoryList,
  mockWorkflowExecutionResults,
  mockXmlSamples
} from '../_mocked';
import {
  HistoryVersion,
  IncrementalHarvestingAllowedResult,
  PluginAvailabilityList,
  PluginType,
  ReportAvailability,
  WorkflowExecution
} from '../_models';
import { DatasetsService, WorkflowService } from '.';

describe('WorkflowService', () => {
  let httpTesting: HttpTestingController;
  let service: WorkflowService;

  const expectRequest = (method: string, path: string) => {
    const req = httpTesting.expectOne({ method, url: `${apiSettings.apiHostCore}${path}` });
    return {
      body(expectedBody: unknown) {
        expect(req.request.body).toEqual(expectedBody);
        return this;
      },
      flush: (...args: Parameters<typeof req.flush>) => req.flush(...args)
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: DatasetsService, useClass: MockDatasetsService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    httpTesting = TestBed.inject(HttpTestingController);
    service = TestBed.inject(WorkflowService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should get workflow for the dataset', () => {
    const sub = service.getWorkflowForDataset('664').subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    expectRequest('GET', '/orchestrator/workflows/664').flush(mockWorkflow);
    sub.unsubscribe();
  });

  it('should get the harvest data', () => {
    const sub = service.getPublishedHarvestedData('663').subscribe((data) => {
      expect(data).toEqual(mockHarvestData);
    });
    expectRequest('GET', '/orchestrator/workflows/executions/dataset/663/information').flush(
      mockHarvestData
    );
    sub.unsubscribe();
  });

  it('should update a workflow', () => {
    const sub = service
      .createWorkflowForDataset('5435', { datasetId: '5435' }, false)
      .subscribe((workflow) => {
        expect(workflow).toEqual(mockWorkflow);
      });
    expectRequest('PUT', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .flush(mockWorkflow);
    sub.unsubscribe();
  });

  it('should create a workflow', () => {
    const sub = service
      .createWorkflowForDataset('5435', { datasetId: '5435' }, true)
      .subscribe((workflow) => {
        expect(workflow).toEqual(mockWorkflow);
      });
    expectRequest('POST', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .flush(mockWorkflow);
    sub.unsubscribe();
  });

  it('should start a workflow', () => {
    service.startWorkflow('6535').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecution);
    });
    expectRequest(
      'POST',
      '/orchestrator/workflows/6535/execute?priority=0&enforcedPluginType='
    ).flush(mockWorkflowExecution);
  });

  it('should get a report', () => {
    const sub = service.getReport('56436456', 'normalization').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });
    expectRequest(
      'GET',
      '/orchestrator/proxies/normalization/task/56436456/report?idsPerError=100'
    ).flush(mockReport);
    sub.unsubscribe();
  });

  it('should get (cached) task errors for finished tasks', () => {
    const sub = service
      .getCachedHasErrors('54353534', 'normalization', true)
      .pipe(toArray())
      .subscribe((res) => {
        expect(res).toEqual([false]);
      });
    expectRequest('GET', '/orchestrator/proxies/normalization/task/54353534/report/exists').flush({
      existsExternalTaskReport: false
    });

    sub.unsubscribe();

    const sub1 = service
      .getCachedHasErrors('7866', 'normalization', true)
      .pipe(toArray())
      .subscribe((res) => {
        expect(res).toEqual([true]);
      });
    const sub2 = service
      .getCachedHasErrors('7866', 'normalization', true)
      .pipe(toArray())
      .subscribe((res) => {
        expect(res).toEqual([true]);
      });
    expectRequest('GET', '/orchestrator/proxies/normalization/task/7866/report/exists').flush(
      mockReportAvailability
    );
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get (stale) task report availabilities for unfinished tasks', () => {
    function getReportAvailability(
      reportAvailability: ReportAvailability,
      expectReq: boolean,
      done: () => void
    ): void {
      const sub = service.getCachedHasErrors('7866', 'normalization', false).subscribe((res) => {
        expect(res).toEqual(true);
      });

      if (expectReq) {
        expectRequest('GET', '/orchestrator/proxies/normalization/task/7866/report/exists').flush(
          reportAvailability
        );
      }
      sub.unsubscribe();
      done();
    }

    const noReport = { existsExternalTaskReport: false } as ReportAvailability;
    const withReport = mockReportAvailability;

    getReportAvailability(withReport, true, () => {
      getReportAvailability(noReport, false, () => {
        getReportAvailability(withReport, false, () => {
          expect(1).toBe(1); // dummy check for coverage
        });
      });
    });
  });

  it('should evict the finished task cache record if getCachedHasErrors encounters a network error', async () => {
    const cacheKey = '54353534/normalization/true';
    const httpMockController = TestBed.inject(HttpTestingController);

    try {
      const streamPromise = firstValueFrom(
        service.getCachedHasErrors('54353534', 'normalization', true)
      );

      const req = httpMockController.expectOne(
        `${apiSettings.apiHostCore}/orchestrator/proxies/normalization/task/54353534/report/exists`
      );
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

      await streamPromise;
      expect.fail('Should have failed with a network error');
    } catch (err) {
      // 3. Run your assertions inside the clean error block handle context
      expect(err).toBeDefined();
      const cacheMap = service['hasErrorsCacheMap'];
      expect(cacheMap.has(cacheKey)).toBe(false);
    }
  });

  it('should evict the unfinished task cache record if getCachedHasErrors encounters a network error', async () => {
    const cacheKey = '9999/normalization/false';
    const httpMockController = TestBed.inject(HttpTestingController);

    try {
      const streamPromise = firstValueFrom(
        service.getCachedHasErrors('9999', 'normalization', false)
      );

      const req = httpMockController.expectOne(
        `${apiSettings.apiHostCore}/orchestrator/proxies/normalization/task/9999/report/exists`
      );
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

      await streamPromise;
      expect.fail('Should have failed with a network error');
    } catch (err) {
      expect(err).toBeDefined();
      const cacheMap = service['hasErrorsCacheMap'];
      expect(cacheMap.has(cacheKey)).toBe(false);
    }
  });

  it('should get dataset execution summaries per page', () => {
    const sub = service.getCompletedDatasetOverviewsUptoPage(0).subscribe((results) => {
      expect(results.results).toEqual(mockDatasetOverviewResults.results);
    });
    expectRequest('GET', '/orchestrator/workflows/executions/overview' + '?nextPage=0').flush(
      mockDatasetOverviewResults
    );
    sub.unsubscribe();
  });

  it('should get if incremental harvest is allowed', () => {
    const sub = service.getIsIncrementalHarvestAllowed('1').subscribe((result: boolean) => {
      expect(result).toEqual(true);
    });
    expectRequest('GET', '/orchestrator/workflows/executions/dataset/1/allowed_incremental').flush({
      incrementalHarvestingAllowed: true
    } as IncrementalHarvestingAllowedResult);
    sub.unsubscribe();
  });

  it('should get completed executions for a dataset per page', () => {
    const sub = service.getCompletedDatasetExecutions('543452', 6).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=6'
    ).flush(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get multiple pages of completed executions for a dataset', () => {
    const sub1 = service.getCompletedDatasetExecutionsUptoPage('543452', 1).subscribe((results) => {
      expect(results.results).toEqual(
        mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=0'
    ).flush(mockWorkflowExecutionResults);
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=1'
    ).flush(mockWorkflowExecutionResults);

    const sub2 = service.getCompletedDatasetExecutionsUptoPage('543452', 0).subscribe((results) => {
      expect(results.results).toEqual(mockWorkflowExecutionResults.results);
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=0'
    ).flush(mockFirstPageResults);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get all executions for a dataset', () => {
    const sub = service.getDatasetHistory('879').subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionHistoryList);
    });
    expectRequest('GET', '/orchestrator/workflows/executions/dataset/879/history').flush(
      mockWorkflowExecutionHistoryList
    );
    sub.unsubscribe();
  });

  it('should get all plugins for an execution history', () => {
    const pal: PluginAvailabilityList = {
      plugins: [{ pluginType: PluginType.HTTP_HARVEST, canDisplayRawXml: true }]
    };
    const sub = service.getExecutionPlugins('123').subscribe((results) => {
      expect(results).toEqual(pal);
    });
    expectRequest('GET', '/orchestrator/workflows/executions/123/plugins/data-availability').flush(
      pal
    );
    sub.unsubscribe();
  });

  it('should get all finished executions for a dataset', () => {
    const sub = service.getFinishedDatasetExecutions('677', 8).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/677' +
        '?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=8'
    ).flush(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get the last execution for a dataset', () => {
    const sub = service.getLastDatasetExecution('787').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecutionResults.results[0]);
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions/dataset/787?orderField=CREATED_DATE&ascending=false'
    ).flush(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get all executions (ongoing)', () => {
    const sub1 = service.getAllExecutionsUptoPage(0, true).subscribe((results) => {
      expect(results).toBeTruthy();
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
    ).flush({ results: mockWorkflowExecutionResults.results, more: false });
    sub1.unsubscribe();
  });

  it('should get all executions', () => {
    const sub1 = service.getAllExecutionsCollectingPages(false).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
    ).flush(mockFirstPageResults);
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
    ).flush(mockWorkflowExecutionResults);

    const sub2 = service.getAllExecutionsCollectingPages(true).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
    ).flush(mockFirstPageResults);
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
    ).flush(mockWorkflowExecutionResults);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get all executions upto a certain page', () => {
    const sub1 = service.getAllExecutionsUptoPage(1, false).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results),
        more: false
      });
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
    ).flush(mockWorkflowExecutionResults);
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
    ).flush(mockWorkflowExecutionResults);

    const sub2 = service.getAllExecutionsUptoPage(1, true).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockFirstPageResults.results),
        more: true
      });
    });
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
    ).flush(mockWorkflowExecutionResults);
    expectRequest(
      'GET',
      '/orchestrator/workflows/executions' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
    ).flush(mockFirstPageResults);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get the report availabilities for an execution', () => {
    const execution: WorkflowExecution = JSON.parse(
      JSON.stringify(mockWorkflowExecutionResults.results[4])
    );
    expect(execution.metisPlugins[0].hasReport).toBe(undefined);
    service.getReportsForExecution(execution);
    expectRequest('GET', '/orchestrator/proxies/normalization/task/123/report/exists').flush(
      mockReportAvailability
    );
    expect(execution.metisPlugins[0].hasReport).toBe(true);

    execution.metisPlugins[0].externalTaskId = undefined;
    service.getReportsForExecution(execution);
    expect(execution.metisPlugins[0].hasReport).toBe(true);
  });

  it('should cancel a workflow (DELETE)', () => {
    const sub = service.cancelThisWorkflow('565645').subscribe(() => undefined);
    expectRequest('DELETE', '/orchestrator/workflows/executions/565645').flush({});
    sub.unsubscribe();
  });

  it('should get the complete dataset summaries', () => {
    const expectedUrl = '/orchestrator/workflows/executions/overview?pageCount=3&nextPage=0';
    const sub = service.getCompletedDatasetSummaries(2).subscribe(() => undefined);
    expectRequest('GET', expectedUrl).flush({});
    sub.unsubscribe();

    const paramString = '&x=y';
    const sub2 = service.getCompletedDatasetSummaries(2, paramString).subscribe(() => undefined);
    expectRequest('GET', `${expectedUrl}${paramString}`).flush({});
    sub2.unsubscribe();
  });

  it('should get samples', () => {
    const sub = service
      .getWorkflowSamples('5653454353', PluginType.ENRICHMENT)
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    expectRequest(
      'GET',
      '/orchestrator/proxies/records?workflowExecutionId=5653454353&pluginType=ENRICHMENT&nextPage='
    ).flush({ records: mockXmlSamples });
    sub.unsubscribe();
  });

  it('should get records from predecessor', () => {
    const ids = { ids: ['1', '2'] };
    const sub = service
      .getRecordFromPredecessor('5653454353', PluginType.ENRICHMENT, ids.ids)
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    expectRequest(
      'POST',
      '/orchestrator/proxies/recordfrompredecessorplugin?workflowExecutionId=5653454353&pluginType=ENRICHMENT'
    )
      .body(ids)
      .flush({ records: mockXmlSamples });
    sub.unsubscribe();
  });

  it('should get records by id', () => {
    const ids = { ids: ['1', '2'] };
    const sub = service
      .getWorkflowRecordsById('5653454353', PluginType.ENRICHMENT, ids.ids)
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    expectRequest(
      'POST',
      '/orchestrator/proxies/recordsbyids?workflowExecutionId=5653454353&pluginType=ENRICHMENT'
    )
      .body(ids)
      .flush({ records: mockXmlSamples });
    sub.unsubscribe();
  });

  it('should search records by id', () => {
    const id = '1';
    const sub = service
      .searchWorkflowRecordsById('5653454353', PluginType.ENRICHMENT, id)
      .subscribe((sample) => {
        expect(sample).toEqual(mockXmlSamples[0]);
      });
    expectRequest(
      'POST',
      `/orchestrator/proxies/recordsearchbyid?workflowExecutionId=5653454353&pluginType=ENRICHMENT&idToSearch=${id}`
    ).flush(mockXmlSamples[0]);
    sub.unsubscribe();
  });

  it('should get statistics', () => {
    const sub = service.getStatistics('normalization', '-4354').subscribe((statistics) => {
      expect(statistics).toEqual(mockStatistics);
    });
    expectRequest('GET', '/orchestrator/proxies/normalization/task/-4354/statistics').flush(
      mockStatistics
    );
    sub.unsubscribe();
  });

  it('should get statistics detail', () => {
    const sub = service
      .getStatisticsDetail('normalization', '-4354', 'abc')
      .subscribe((statistics) => {
        expect(statistics).toEqual(mockStatisticsDetail);
      });
    expectRequest(
      'GET',
      '/orchestrator/proxies/normalization/task/-4354/nodestatistics?nodePath=abc'
    ).flush(mockStatisticsDetail);
    sub.unsubscribe();
  });

  it('should add the datasetName and current plugin ', () => {
    service.addDatasetNameAndCurrentPlugin([mockWorkflowExecution]).subscribe((res) => {
      expect(res.length).toBeGreaterThan(0);
    });
  });

  it('should handle addDatasetNameAndCurrentPlugin with an empty list', () => {
    service.addDatasetNameAndCurrentPlugin([]).subscribe((res) => {
      expect(res).toEqual([]);
    });
  });

  it('should cancel a workflow', () => {
    vi.spyOn(service.promptCancelWorkflow, 'emit');
    service.promptCancelThisWorkflow('15', '11', 'The Name');
    expect(service.promptCancelWorkflow.emit).toHaveBeenCalledWith({
      workflowExecutionId: '15',
      datasetId: '11',
      datasetName: 'The Name'
    });
  });

  it('should get the version history', () => {
    const execId = '123';
    const pluginType = PluginType.HTTP_HARVEST;

    const sub = service
      .getVersionHistory(execId, pluginType)
      .subscribe((versions: Array<HistoryVersion>) => {
        expect(versions).toEqual(mockHistoryVersion.evolutionSteps);
      });

    expectRequest('GET', `/orchestrator/workflows/evolution/${execId}/${pluginType}`).flush(
      mockHistoryVersion
    );
    sub.unsubscribe();
  });
});
