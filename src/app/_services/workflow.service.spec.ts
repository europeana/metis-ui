import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { apiSettings } from '../../environments/apisettings';
import { gatherValuesAsync, MockHttp } from '../_helpers/test-helpers';
import {
  MockAuthenticationService,
  mockDatasetOverviewResults,
  MockDatasetsService,
  MockErrorService,
  mockFirstPageResults,
  mockHarvestData,
  mockLogs,
  mockReport,
  mockReportAvailability,
  mockStatistics,
  mockStatisticsDetail,
  MockTranslateService,
  mockWorkflow,
  mockWorkflowExecution,
  mockWorkflowExecutionHistoryList,
  mockWorkflowExecutionResults,
  mockXmlSamples
} from '../_mocked';
import {
  PluginAvailabilityList,
  PluginType,
  ReportAvailability,
  WorkflowExecution
} from '../_models';
import { getUnsubscribable } from '../_helpers/test-helpers';
import { TranslateService } from '../_translate';

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
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: AuthenticationService, useClass: MockAuthenticationService }
      ],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    mockHttp = new MockHttp(TestBed.inject(HttpTestingController), apiSettings.apiHostCore);
    service = TestBed.inject(WorkflowService);
  }));

  afterEach(() => {
    mockHttp.verify();
  });

  it('should get workflow for the dataset', () => {
    const sub = service.getWorkflowForDataset('664').subscribe((workflow) => {
      expect(workflow).toEqual(mockWorkflow);
    });
    mockHttp.expect('GET', '/orchestrator/workflows/664').send(mockWorkflow);
    sub.unsubscribe();
  });

  it('should get the harvest data', () => {
    const sub = service.getPublishedHarvestedData('663').subscribe((data) => {
      expect(data).toEqual(mockHarvestData);
    });
    mockHttp
      .expect('GET', '/orchestrator/workflows/executions/dataset/663/information')
      .send(mockHarvestData);
    sub.unsubscribe();
  });

  it('should update a workflow', () => {
    const sub = service
      .createWorkflowForDataset('5435', { datasetId: '5435' }, false)
      .subscribe((workflow) => {
        expect(workflow).toEqual(mockWorkflow);
      });
    mockHttp
      .expect('PUT', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .send(mockWorkflow);
    sub.unsubscribe();
  });

  it('should create a workflow', () => {
    const sub = service
      .createWorkflowForDataset('5435', { datasetId: '5435' }, true)
      .subscribe((workflow) => {
        expect(workflow).toEqual(mockWorkflow);
      });
    mockHttp
      .expect('POST', '/orchestrator/workflows/5435')
      .body({ datasetId: '5435' })
      .send(mockWorkflow);
    sub.unsubscribe();
  });

  it('should start a workflow', fakeAsync(() => {
    const sub = service.startWorkflow('6535').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecution);
    });
    mockHttp
      .expect('POST', '/orchestrator/workflows/6535/execute?priority=0&enforcedPluginType=')
      .send(mockWorkflowExecution);
    tick(1);
    sub.unsubscribe();
  }));

  it('should get logs', () => {
    const sub = service.getLogs('43545', 'normalization', 10, 1000).subscribe((logs) => {
      expect(logs).toEqual(mockLogs);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/43545/logs?from=10&to=1000')
      .send(mockLogs);
    sub.unsubscribe();
  });

  it('should get a report', () => {
    const sub = service.getReport('56436456', 'normalization').subscribe((report) => {
      expect(report).toEqual(mockReport);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/56436456/report?idsPerError=100')
      .send(mockReport);
    sub.unsubscribe();
  });

  it('should get (cached) task errors for finished tasks', () => {
    const sub = gatherValuesAsync(
      service.getCachedHasErrors('54353534', 'normalization', true)
    ).subscribe((res) => {
      expect(res).toEqual([false]);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/54353534/report/exists')
      .send({ existsExternalTaskReport: false });

    sub.unsubscribe();

    const sub1 = gatherValuesAsync(
      service.getCachedHasErrors('7866', 'normalization', true)
    ).subscribe((res) => {
      expect(res).toEqual([true]);
    });
    const sub2 = gatherValuesAsync(
      service.getCachedHasErrors('7866', 'normalization', true)
    ).subscribe((res) => {
      expect(res).toEqual([true]);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/7866/report/exists')
      .send(mockReportAvailability);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get (stale) task report availabilities for unfinished tasks', () => {
    function getReportAvailability(
      reportAvailability: ReportAvailability,
      expectRequest: boolean,
      done: () => void
    ): void {
      const sub = service.getCachedHasErrors('7866', 'normalization', false).subscribe((res) => {
        expect(res).toEqual(true);
      });

      if (expectRequest) {
        mockHttp
          .expect('GET', '/orchestrator/proxies/normalization/task/7866/report/exists')
          .send(reportAvailability);
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

  it('should get dataset execution summaries per page', () => {
    const sub = service.getCompletedDatasetOverviewsUptoPage(0).subscribe((results) => {
      expect(results.results).toEqual(mockDatasetOverviewResults.results);
    });
    mockHttp
      .expect('GET', '/orchestrator/workflows/executions/overview' + '?nextPage=0')
      .send(mockDatasetOverviewResults);
    sub.unsubscribe();
  });

  it('should get completed executions for a dataset per page', () => {
    const sub = service.getCompletedDatasetExecutions('543452', 6).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=6'
      )
      .send(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get multiple pages of completed executions for a dataset', () => {
    const sub1 = service.getCompletedDatasetExecutionsUptoPage('543452', 1).subscribe((results) => {
      expect(results.results).toEqual(
        mockWorkflowExecutionResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=0'
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=1'
      )
      .send(mockWorkflowExecutionResults);

    const sub2 = service.getCompletedDatasetExecutionsUptoPage('543452', 0).subscribe((results) => {
      expect(results.results).toEqual(mockWorkflowExecutionResults.results);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/543452' +
          '?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED' +
          '&orderField=CREATED_DATE&ascending=false&nextPage=0'
      )
      .send(mockFirstPageResults);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get all executions for a dataset', () => {
    const sub = service.getDatasetHistory('879').subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionHistoryList);
    });
    mockHttp
      .expect('GET', '/orchestrator/workflows/executions/dataset/879/history')
      .send(mockWorkflowExecutionHistoryList);
    sub.unsubscribe();
  });

  it('should get all plugins for an execution history', () => {
    const pal: PluginAvailabilityList = {
      plugins: [{ pluginType: PluginType.HTTP_HARVEST, canDisplayRawXml: true }]
    };
    const sub = service.getExecutionPlugins('123').subscribe((results) => {
      expect(results).toEqual(pal);
    });
    mockHttp
      .expect('GET', '/orchestrator/workflows/executions/123/plugins/data-availability')
      .send(pal);
    sub.unsubscribe();
  });

  it('should get all finished executions for a dataset', () => {
    const sub = service.getFinishedDatasetExecutions('677', 8).subscribe((results) => {
      expect(results).toEqual(mockWorkflowExecutionResults);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/677' +
          '?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=8'
      )
      .send(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get the last execution for a dataset', () => {
    const sub = service.getLastDatasetExecution('787').subscribe((execution) => {
      expect(execution).toEqual(mockWorkflowExecutionResults.results[0]);
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/dataset/787?orderField=CREATED_DATE&ascending=false'
      )
      .send(mockWorkflowExecutionResults);
    sub.unsubscribe();
  });

  it('should get all executions', () => {
    const sub1 = service.getAllExecutionsCollectingPages(false).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
      )
      .send(mockFirstPageResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
      )
      .send(mockWorkflowExecutionResults);

    const sub2 = service.getAllExecutionsCollectingPages(true).subscribe((results) => {
      expect(results).toEqual(
        mockFirstPageResults.results.concat(mockWorkflowExecutionResults.results)
      );
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      )
      .send(mockFirstPageResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      )
      .send(mockWorkflowExecutionResults);
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
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED'
      )
      .send(mockWorkflowExecutionResults);

    const sub2 = service.getAllExecutionsUptoPage(1, true).subscribe((results) => {
      expect(results).toEqual({
        results: mockWorkflowExecutionResults.results.concat(mockFirstPageResults.results),
        more: true
      });
    });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=0' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      )
      .send(mockWorkflowExecutionResults);
    mockHttp
      .expect(
        'GET',
        '/orchestrator/workflows/executions/' +
          '?orderField=CREATED_DATE&ascending=false&nextPage=1' +
          '&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      )
      .send(mockFirstPageResults);
    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should get the report availabilities for an execution', () => {
    const execution: WorkflowExecution = JSON.parse(
      JSON.stringify(mockWorkflowExecutionResults.results[4])
    );
    expect(execution.metisPlugins[0].hasReport).toBe(undefined);
    service.getReportsForExecution(execution);
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/123/report/exists')
      .send(mockReportAvailability);
    expect(execution.metisPlugins[0].hasReport).toBe(true);
  });

  it('should cancel a workflow (DELETE)', () => {
    const sub = service.cancelThisWorkflow('565645').subscribe(() => undefined);
    mockHttp.expect('DELETE', '/orchestrator/workflows/executions/565645').send({});
    sub.unsubscribe();
  });

  it('should get samples', () => {
    const sub = service
      .getWorkflowSamples('5653454353', PluginType.ENRICHMENT)
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    mockHttp
      .expect(
        'GET',
        '/orchestrator/proxies/records?workflowExecutionId=5653454353&pluginType=ENRICHMENT&nextPage='
      )
      .send({ records: mockXmlSamples });
    sub.unsubscribe();
  });

  it('should get sample comparisons', () => {
    const ids = { ids: ['1', '2'] };
    const sub = service
      .getWorkflowComparisons('5653454353', PluginType.ENRICHMENT, ids.ids)
      .subscribe((samples) => {
        expect(samples).toEqual(mockXmlSamples);
      });
    mockHttp
      .expect(
        'POST',
        '/orchestrator/proxies/recordsbyids?workflowExecutionId=5653454353&pluginType=ENRICHMENT'
      )
      .body(ids)
      .send({ records: mockXmlSamples });
    sub.unsubscribe();
  });

  it('should get statistics', () => {
    const sub = service.getStatistics('normalization', '-4354').subscribe((statistics) => {
      expect(statistics).toEqual(mockStatistics);
    });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/-4354/statistics')
      .send(mockStatistics);
    sub.unsubscribe();
  });

  it('should get statistics detail', () => {
    const sub = service
      .getStatisticsDetail('normalization', '-4354', 'abc')
      .subscribe((statistics) => {
        expect(statistics).toEqual(mockStatisticsDetail);
      });
    mockHttp
      .expect('GET', '/orchestrator/proxies/normalization/task/-4354/nodestatistics?nodePath=abc')
      .send(mockStatisticsDetail);
    sub.unsubscribe();
  });

  it('should handle addDatasetNameAndCurrentPlugin with an empty list', () => {
    service
      .addDatasetNameAndCurrentPlugin([])
      .subscribe((res) => {
        expect(res).toEqual([]);
      })
      .unsubscribe();
  });

  it('should unsubscribe when destroyed', () => {
    const sub = getUnsubscribable();
    service.subs = [sub];
    service.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should cancel a workflow', () => {
    spyOn(service.promptCancelWorkflow, 'emit');
    service.promptCancelThisWorkflow('15', '11', 'The Name');
    expect(service.promptCancelWorkflow.emit).toHaveBeenCalledWith({
      workflowExecutionId: '15',
      datasetId: '11',
      datasetName: 'The Name'
    });
  });
});
