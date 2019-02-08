import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, TestBed } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import { gatherValuesAsync, MockHttp } from '../_helpers/test-helpers';
import {
  MockAuthenticationService,
  MockDatasetsService,
  MockErrorService,
  mockFirstPageResults,
  mockHarvestData,
  mockLogs,
  mockReport,
  mockStatistics,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionResults,
  mockXmlSamples,
} from '../_mocked';
import { Report, WorkflowExecution } from '../_models';

import { AuthenticationService, DatasetsService, ErrorService, WorkflowService } from '.';

describe('workflow service', () => {
  let mockHttp: MockHttp;
  let service: WorkflowService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkflowService,
        { provide: ErrorService, useClass: MockErrorService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: AuthenticationService, useClass: MockAuthenticationService },
      ],
      imports: [HttpClientTestingModule],
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.get(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.get(WorkflowService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get workflow for the dataset', () => {
    service.getWorkflowForDataset('664').subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    mockHttp.expect('GET', '/orchestrator/workflows/664').send(mockWorkflow);
  });

  it('should get the harvest data', () => {
    service.getPublishedHarvestedData('663').subscribe((data) => {
      expect(data).toEqual(mockHarvestData);
    });
    mockHttp
      .expect('GET', '/orchestrator/workflows/executions/dataset/663/information')
      .send(mockHarvestData);
  });

  it('should update a workflow', () => {
    service.createWorkflowForDataset('5435', { datasetId: '5435' }, false).subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    mockHttp
      .expect('PUT', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .send(mockWorkflow);
  });

  it('should create a workflow', () => {
    service.createWorkflowForDataset('5435', { datasetId: '5435' }, true).subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    mockHttp
      .expect('POST', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .send(mockWorkflow);
  });

  it('should start a workflow', () => {
    service.startWorkflow('6535').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecution);
    });
    mockHttp
      .expect('POST', '/orchestrator/workflows/6535/execute?priority=0&enforcedPluginType=')
      .send(mockWorkflowExecution);
  });

  it('should get logs', () => {
    service.getLogs('43545', 'normalization', 10, 1000).subscribe((logs) => {
      expect(logs).toEqual(mockLogs);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/43545/logs?from=10&to=1000')
      .send(mockLogs);
  });

  it('should get a report', () => {
    service.getReport('56436456', 'normalization').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/56436456/report?idsPerError=100')
      .send(mockReport);
  });

  it('should get (cached) task errors for finished tasks', () => {
    gatherValuesAsync(service.getCachedHasErrors('54353534', 'normalization', true)).subscribe(
      (res) => {
        expect(res).toEqual([false]);
      },
    );
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/54353534/report?idsPerError=100')
      .send({});

    gatherValuesAsync(service.getCachedHasErrors('7866', 'normalization', true)).subscribe(
      (res) => {
        expect(res).toEqual([true]);
      },
    );
    gatherValuesAsync(service.getCachedHasErrors('7866', 'normalization', true)).subscribe(
      (res) => {
        expect(res).toEqual([true]);
      },
    );
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/7866/report?idsPerError=100')
      .send(mockReport);
  });

  it('should get (stale) task errors for unfinished tasks', () => {
    function getReport(
      report: Report,
      expectedHasError: boolean,
      expectRequest: boolean,
      done: () => void,
    ): void {
      service.getCachedHasErrors('7866', 'normalization', false).subscribe((res) => {
        expect(res).toEqual(expectedHasError);
        done();
      });
      if (expectRequest) {
        mockHttp
          .expect('GET', '/orchestrator/proxies/normalization/task/7866/report?idsPerError=100')
          .send(report);
      }
    }

    const noErrors = { id: 123, errors: [] };
    const withErrors = mockReport;

    getReport(noErrors, false, true, () => {
      getReport(noErrors, false, true, () => {
        getReport(withErrors, true, true, () => {
          getReport(withErrors, true, false, () => {
            getReport(withErrors, true, false, () => {
              expect(1).toBe(1); // dummy check for coverage
            });
          });
        });
      });
    });
  });

  it('should get completed executions for a dataset per page', () => {
    service.getCompletedDatasetExecutions('543452', 6).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=6',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get multiple pages of completed executions for a dataset', () => {
    service.getCompletedDatasetExecutionsUptoPage('543452', 1).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results),
        more: false,
      });
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=0',
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=1',
      )
      .send(mockWorkflowExecutionResults);

    service.getCompletedDatasetExecutionsUptoPage('543452', 0).subscribe((results) => {
      expect(results).toEqual({ results: mockWorkflowExecutionResults.results, more: true });
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=0',
      )
      .send(mockFirstPageResults);
  });

  it('should get executions for a dataset per page', () => {
    service.getDatasetExecutions('543341', 7).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543341?orderField=CREATED_DATE&ascending=false&nextPage=7',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get all executions for a dataset', () => {
    service.getDatasetExecutionsCollectingPages('879').subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/879?orderField=CREATED_DATE&ascending=false&nextPage=0',
      )
      .send(mockFirstPageResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/879?orderField=CREATED_DATE&ascending=false&nextPage=1',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get all finished executions for a dataset', () => {
    service.getFinishedDatasetExecutions('677', 8).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/677?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=8',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get the last execution for a dataset', () => {
    service.getLastDatasetExecution('787').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecutionResults.results[0]);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/787?orderField=CREATED_DATE&ascending=false',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get all executions', () => {
    service.getAllExecutionsCollectingPages(false).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      )
      .send(mockFirstPageResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      )
      .send(mockWorkflowExecutionResults);

    service.getAllExecutionsCollectingPages(true).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results),
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      )
      .send(mockFirstPageResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      )
      .send(mockWorkflowExecutionResults);
  });

  it('should get all executions upto a certain page', () => {
    service.getAllExecutionsUptoPage(1, false).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results),
        more: false,
      });
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED',
      )
      .send(mockWorkflowExecutionResults);

    service.getAllExecutionsUptoPage(1, true).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockFirstPageResults.results),
        more: true,
      });
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING',
      )
      .send(mockFirstPageResults);
  });

  it('should get the reports for an execution', () => {
    const execution: WorkflowExecution = JSON.parse(
      JSON.stringify(mockWorkflowExecutionResults.results[4]),
    );
    expect(execution.metisPlugins[0].hasReport).toBe(undefined);
    service.getReportsForExecution(execution);
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/123/report?idsPerError=100')
      .send(mockReport);
    expect(execution.metisPlugins[0].hasReport).toBe(true);
  });

  it('should cancel a workflow', () => {
    service.cancelThisWorkflow('565645').subscribe(() => {});
    mockHttp.expect('DELETE', '/orchestrator/workflows/executions/565645').send({});
  });

  it('should get samples', () => {
    service.getWorkflowSamples('5653454353', 'ENRICHMENT').subscribe((samples) => {
      expect(samples).toEqual(mockXmlSamples);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/proxies/records?workflowExecutionId=5653454353&pluginType=ENRICHMENT&nextPage=',
      )
      .send({ records: mockXmlSamples });
  });

  it('should get statistics', () => {
    service.getStatistics('normalization', '-4354').subscribe((statistics) => {
      expect(statistics).toEqual(mockStatistics);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/-4354/statistics')
      .send(mockStatistics);
  });

  it('should handle addDatasetNameAndCurrentPlugin with an empty list', () => {
    service.addDatasetNameAndCurrentPlugin([]).subscribe((res) => {
      expect(res).toEqual([]);
    });
  });

  it('should cancel a workflow', () => {
    spyOn(service.promptCancelWorkflow, 'emit');
    service.promptCancelThisWorkflow('15', '11', 'The Name');
    expect(service.promptCancelWorkflow.emit).toHaveBeenCalledWith({
      workflowExecutionId: '15',
      datasetId: '11',
      datasetName: 'The Name',
    });
  });
});
