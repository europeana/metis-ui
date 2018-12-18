import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import {
  MockDatasetService,
  MockErrorService,
  mockFirstPageResults,
  mockHarvestData,
  mockLogs,
  mockReport,
  mockStatistics,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionResults, mockXmlSamples,
} from '../_mocked';
import { WorkflowExecution } from '../_models';

import { DatasetsService, ErrorService, WorkflowService } from '.';

describe('workflow service', () => {
  let mockHttp: HttpTestingController;
  let service: WorkflowService;

  // tslint:disable-next-line: no-any
  function expectHttp<Data>(method: string, url: string, body: any, data: Data): void {
    const req = mockHttp.expectOne(apiSettings.apiHostCore + url);
    expect(req.request.method).toBe(method);
    expect(req.request.body).toEqual(body);
    req.flush(data);
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowService,
        { provide: ErrorService, useClass: MockErrorService },
        { provide: DatasetsService, useClass: MockDatasetService },
      ],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    mockHttp = TestBed.get(HttpTestingController);
    service = TestBed.get(WorkflowService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get workflow for the dataset', () => {
    service.getWorkflowForDataset('664').subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    expectHttp('GET', '/orchestrator/workflows/664', null, mockWorkflow);
  });

  it('should get the harvest data', () => {
    service.getPublishedHarvestedData('663').subscribe((data) => {
      expect(data).toEqual(mockHarvestData);
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/663/information',
      null,
      mockHarvestData,
    );
  });

  it('should update a workflow', () => {
    service.createWorkflowForDataset('5435', { datasetId: '5435' }, false).subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    expectHttp('PUT', '/orchestrator/workflows/5435', { datasetId: '5435' }, mockWorkflow);
  });

  it('should create a workflow', () => {
    service.createWorkflowForDataset('5435', { datasetId: '5435' }, true).subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    expectHttp('POST', '/orchestrator/workflows/5435', { datasetId: '5435' }, mockWorkflow);
  });

  it('should start a workflow', () => {
    service.startWorkflow('6535').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecution);
    });
    expectHttp(
      'POST',
      '/orchestrator/workflows/6535/execute?priority=0&enforcedPluginType=',
      {},
      mockWorkflowExecution,
    );
  });

  it('should get logs', () => {
    service.getLogs('43545', 'normalization', 10, 1000).subscribe((logs) => {
      expect(logs).toEqual(mockLogs);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/43545/logs?from=10&to=1000',
      null,
      mockLogs,
    );
  });

  it('should get a report', () => {
    service.getReport('56436456', 'normalization').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/56436456/report?idsPerError=100',
      null,
      mockReport,
    );
  });

  it('should get (cached) task errors', () => {
    service.getCachedHasErrors('54353534', 'normalization').subscribe((hasErrors) => {
      expect(hasErrors).toBe(false);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/54353534/report?idsPerError=100',
      null,
      {},
    );

    service.getCachedHasErrors('7866', 'normalization').subscribe((hasErrors) => {
      expect(hasErrors).toBe(true);
    });
    service.getCachedHasErrors('7866', 'normalization').subscribe((hasErrors) => {
      expect(hasErrors).toBe(true);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/7866/report?idsPerError=100',
      null,
      mockReport,
    );
  });

  it('should get completed executions for a dataset per page', () => {
    service.getCompletedDatasetExecutions('543452', 6).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=6',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get multiple pages of completed executions for a dataset', () => {
    service.getCompletedDatasetExecutionsUptoPage('543452', 1).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results),
        more: false,
      });
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=0',
      null,
      mockWorkflowExecutionResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=1',
      null,
      mockWorkflowExecutionResults,
    );

    service.getCompletedDatasetExecutionsUptoPage('543452', 0).subscribe((results) => {
      expect(results).toEqual({ results: mockWorkflowExecutionResults.results, more: true });
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/543452' +
        '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
        '&orderField=CREATED_DATE&ascending=false&nextPage=0',
      null,
      mockFirstPageResults,
    );
  });

  it('should get executions for a dataset per page', () => {
    service.getDatasetExecutions('543341', 7).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/543341?orderField=CREATED_DATE&ascending=false&nextPage=7',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get all executions for a dataset', () => {
    service.getDatasetExecutionsCollectingPages('879').subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/879?orderField=CREATED_DATE&ascending=false&nextPage=0',
      null,
      mockFirstPageResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/879?orderField=CREATED_DATE&ascending=false&nextPage=1',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get all finished executions for a dataset', () => {
    service.getFinishedDatasetExecutions('677', 8).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/677?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=8',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get the last execution for a dataset', () => {
    service.getLastDatasetExecution('787').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecutionResults.results[0]);
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/dataset/787?orderField=CREATED_DATE&ascending=false',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get all executions', () => {
    service.getAllExecutionsCollectingPages(false).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      null,
      mockFirstPageResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      null,
      mockWorkflowExecutionResults,
    );

    service.getAllExecutionsCollectingPages(true).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      null,
      mockFirstPageResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      null,
      mockWorkflowExecutionResults,
    );
  });

  it('should get all executions upto a certain page', () => {
    service.getAllExecutionsUptoPage(1, false).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results),
        more: false,
      });
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      null,
      mockWorkflowExecutionResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      null,
      mockWorkflowExecutionResults,
    );

    service.getAllExecutionsUptoPage(1, true).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockFirstPageResults.results),
        more: true,
      });
    });
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      null,
      mockWorkflowExecutionResults,
    );
    expectHttp(
      'GET',
      '/orchestrator/workflows/executions/' +
        '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
        '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      null,
      mockFirstPageResults,
    );
  });

  it('should get the reports for an execution', () => {
    const execution: WorkflowExecution = JSON.parse(
      JSON.stringify(mockWorkflowExecutionResults.results[4]),
    );
    expect(execution.metisPlugins[0].hasReport).toBe(undefined);
    service.getReportsForExecution(execution);
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/123/report?idsPerError=100',
      null,
      mockReport,
    );
    expect(execution.metisPlugins[0].hasReport).toBe(true);
  });

  it('should cancel a workflow', () => {
    service.cancelThisWorkflow('565645').subscribe(() => {});
    expectHttp('DELETE', '/orchestrator/workflows/executions/565645', null, {});
  });

  it('should get samples', () => {
    service.getWorkflowSamples('5653454353', 'ENRICHMENT').subscribe((samples) => {
      expect(samples).toEqual(mockXmlSamples);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/records?workflowExecutionId=5653454353&pluginType=ENRICHMENT&nextPage=',
      null,
      { records: mockXmlSamples },
    );
  });

  it('should get statistics', () => {
    service.getStatistics('normalization', '-4354').subscribe((statistics) => {
      expect(statistics).toEqual(mockStatistics);
    });
    expectHttp(
      'GET',
      '/orchestrator/proxies/normalization/task/-4354/statistics',
      null,
      mockStatistics,
    );
  });
});
