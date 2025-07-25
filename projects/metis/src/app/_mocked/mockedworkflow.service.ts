import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

import {
  DatasetOverview,
  HarvestData,
  HistoryVersion,
  HistoryVersions,
  MoreResults,
  NodePathStatistics,
  PluginAvailabilityList,
  PluginExecution,
  PluginStatus,
  PluginType,
  Report,
  ReportAvailability,
  Results,
  Statistics,
  SubTaskInfo,
  TaskState,
  ThrottleLevel,
  Workflow,
  WorkflowExecution,
  WorkflowExecutionHistoryList,
  WorkflowStatus,
  XmlSample
} from '../_models';

const novemberNineteenthFinish = '2019-11-19T13:07:70.844Z';
const novemberNineteenthStart = '2019-11-19T12:47:10.844Z';
const novemberFifth = '2018-11-05T15:38:18.450Z';
const xPathProvider = '//rdf:RDF/edm:ProvidedCHO/@rdf:about';

export const mockHistoryVersions: Array<HistoryVersion> = [
  {
    workflowExecutionId: '1',
    pluginType: PluginType.OAIPMH_HARVEST
  },
  {
    workflowExecutionId: '1',
    pluginType: PluginType.VALIDATION_EXTERNAL
  },
  {
    workflowExecutionId: '1',
    pluginType: PluginType.TRANSFORMATION
  }
];

export const mockHistoryVersion: HistoryVersions = {
  evolutionSteps: mockHistoryVersions
};

export const mockWorkflow: Workflow = {
  datasetId: '1',
  id: '1',
  metisPluginsMetadata: [
    {
      enabled: true,
      metadataFormat: 'edm',
      pluginType: PluginType.OAIPMH_HARVEST,
      setSpec: 'oai_test',
      url: 'http://www.mocked.com'
    },
    {
      enabled: true,
      pluginType: PluginType.TRANSFORMATION,
      customXslt: false
    },
    {
      enabled: true,
      pluginType: PluginType.MEDIA_PROCESS,
      throttlingLevel: ThrottleLevel.MEDIUM
    },
    {
      enabled: true,
      pluginType: PluginType.LINK_CHECKING
    }
  ]
};

export const mockDatasetOverviewResults: Results<DatasetOverview> = {
  results: [
    {
      dataset: {
        datasetName: 'Dataset 2',
        datasetId: '129'
      },
      executionProgress: {
        stepsDone: 3,
        stepsTotal: 11,
        currentPluginProgress: {
          errors: 49,
          processedRecords: 232,
          expectedRecords: 233,
          progressPercentage: 99
        }
      },
      execution: {
        id: 'execution-id-1',
        finishedDate: '2018-10-19T09:23:70.844Z',
        startedDate: '2018-10-19T09:05:40.844Z',
        plugins: [
          {
            pluginType: PluginType.OAIPMH_HARVEST,
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 114092,
              processedRecords: 114092,
              progressPercentage: 100,
              errors: 0,
              deletedRecords: 21
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.HTTP_HARVEST,
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 900,
              progressPercentage: 100,
              errors: 20
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.TRANSFORMATION,
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 90,
              progressPercentage: 10,
              errors: 12
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          }
        ]
      }
    },
    {
      dataset: {
        datasetName: 'Dataset 1',
        datasetId: '123'
      },
      executionProgress: {
        stepsDone: 2,
        stepsTotal: 3,
        currentPluginProgress: {
          errors: 92,
          processedRecords: 444,
          expectedRecords: 3000,
          progressPercentage: 22
        }
      },
      execution: {
        id: 'execution-id-1',
        startedDate: '2011-11-19T09:05:40.844Z',
        plugins: [
          {
            pluginType: PluginType.OAIPMH_HARVEST,
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 90,
              progressPercentage: 10,
              errors: 12
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.HTTP_HARVEST,
            pluginStatus: PluginStatus.CANCELLED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.TRANSFORMATION,
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.LINK_CHECKING,
            pluginStatus: PluginStatus.FINISHED,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            finishedDate: novemberNineteenthFinish,
            startedDate: novemberNineteenthStart
          },
          {
            pluginType: PluginType.ENRICHMENT,
            pluginStatus: PluginStatus.RUNNING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            startedDate: novemberNineteenthStart,
            finishedDate: novemberNineteenthFinish
          },
          {
            pluginType: PluginType.MEDIA_PROCESS,
            pluginStatus: PluginStatus.RUNNING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            startedDate: novemberNineteenthStart,
            finishedDate: novemberNineteenthFinish
          },
          {
            pluginType: PluginType.VALIDATION_EXTERNAL,
            pluginStatus: PluginStatus.INQUEUE,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            startedDate: novemberNineteenthStart,
            finishedDate: novemberNineteenthFinish
          },
          {
            pluginType: PluginType.VALIDATION_INTERNAL,
            pluginStatus: PluginStatus.CLEANING,

            progress: {
              expectedRecords: 900,
              processedRecords: 10,
              progressPercentage: 0,
              errors: 10
            },

            startedDate: novemberNineteenthStart,
            finishedDate: novemberNineteenthFinish
          }
        ]
      }
    }
  ],
  listSize: 5,
  nextPage: -1
};

export const mockWorkflowExecutionHistoryList: WorkflowExecutionHistoryList = {
  executions: [
    {
      workflowExecutionId: '253453453',
      startedDate: novemberFifth
    }
  ]
};

export const mockWorkflowExecutionResults: Results<WorkflowExecution> = {
  results: [
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.INQUEUE,
      isIncremental: false,
      createdDate: novemberFifth,
      updatedDate: '',
      startedDate: '',
      startedBy: undefined,
      metisPlugins: [
        {
          pluginType: PluginType.VALIDATION_EXTERNAL,
          id: '432552345',
          startedDate: novemberFifth,
          updatedDate: novemberFifth,
          pluginStatus: PluginStatus.INQUEUE,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.SENT
          }
        }
      ]
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.RUNNING,
      isIncremental: false,
      createdDate: novemberFifth,
      updatedDate: '',
      startedDate: '',
      startedBy: '1482250000001617026',
      metisPlugins: [
        {
          pluginType: PluginType.NORMALIZATION,
          id: '432552345',
          startedDate: novemberFifth,
          updatedDate: novemberFifth,
          pluginStatus: PluginStatus.RUNNING,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED
          }
        }
      ]
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.FAILED,
      isIncremental: false,
      createdDate: novemberFifth,
      updatedDate: '',
      startedDate: '',
      startedBy: '1482250000001617026',
      metisPlugins: [
        {
          pluginType: PluginType.NORMALIZATION,
          id: '432552345',
          startedDate: novemberFifth,
          updatedDate: novemberFifth,
          pluginStatus: PluginStatus.FAILED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED
          }
        }
      ]
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.CANCELLED,
      isIncremental: false,
      createdDate: novemberFifth,
      updatedDate: '',
      startedDate: '',
      startedBy: '1482250000001617026',
      metisPlugins: [
        {
          pluginType: PluginType.NORMALIZATION,
          id: '432552345',
          startedDate: novemberFifth,
          updatedDate: novemberFifth,
          pluginStatus: PluginStatus.CANCELLED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED
          }
        }
      ]
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.FINISHED,
      isIncremental: false,
      createdDate: novemberFifth,
      updatedDate: '',
      startedDate: '',
      startedBy: '1482250000001617026',
      metisPlugins: [
        {
          pluginType: PluginType.NORMALIZATION,
          id: '432552345',
          startedDate: novemberFifth,
          updatedDate: novemberFifth,
          pluginStatus: PluginStatus.FINISHED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED
          }
        }
      ]
    }
  ],
  listSize: 5,
  nextPage: -1
};

export const mockFirstPageResults: Results<WorkflowExecution> = {
  ...mockWorkflowExecutionResults,
  nextPage: 1
};

export const mockWorkflowExecution: WorkflowExecution = mockWorkflowExecutionResults.results[0];
export const mockPluginExecution: PluginExecution = mockWorkflowExecution.metisPlugins[0];

export const mockXmlSamples: XmlSample[] = [
  {
    ecloudId: '1',
    xmlRecord: '<?xml version="1.0" encoding="UTF-8"?>'
  }
];

export const mockStatistics: Statistics = {
  taskId: 5,
  nodePathStatistics: [
    {
      xPath: '//rdf:RDF/edm:ProvidedCHO/dc:creator',

      nodeValueStatistics: [
        {
          occurrences: 2,
          value: 'desconegut',

          attributeStatistics: [
            {
              xPath: '//rdf:RDF/edm:ProvidedCHO/dc:creator/@xml:lang',
              occurrences: 2,
              value: 'ca'
            }
          ]
        }
      ]
    }
  ]
};

export const mockStatisticsDetail: NodePathStatistics = {
  xPath: '//rdf:RDF/edm:ProvidedCHO/dc:creator',
  nodeValueStatistics: [
    {
      value: 'value 1',
      occurrences: 876,
      attributeStatistics: [
        {
          xPath: xPathProvider,
          value: 'new value 1',
          occurrences: 9
        },
        {
          xPath: xPathProvider,
          value: 'new value 2',
          occurrences: 8
        },
        {
          xPath: xPathProvider,
          value: 'new value 3',
          occurrences: 7
        },
        {
          xPath: xPathProvider,
          value: 'new value 4',
          occurrences: 6
        }
      ]
    }
  ]
};

export const mockReport: Report = {
  id: '123',
  errors: [
    {
      errorType: 'errorType',
      message: 'errorMessage',
      occurrences: 9,
      errorDetails: []
    }
  ]
};

export const mockReportAvailability: ReportAvailability = {
  existsExternalTaskReport: true
};

export const mockHarvestData: HarvestData = {
  lastPreviewDate: '2018-03-28T13:53:04.762Z',
  lastPreviewRecords: 842,
  lastPreviewRecordsReadyForViewing: true,
  firstPublishedDate: '2018-03-28T13:53:04.762Z',
  lastPublishedDate: '2018-03-30T13:53:04.762Z',
  lastPublishedRecords: 842,
  lastPublishedRecordsReadyForViewing: true,
  lastHarvestedDate: '2018-03-30T13:53:04.762Z',
  lastHarvestedRecords: 842,
  totalPreviewRecords: 842,
  totalPublishedRecords: 842
};

export const mockLogs = [
  {
    resourceNum: 5,
    resource: 'dsv',
    state: 'st',
    info: 'fdsfsd',
    resultResource: 'xcsdc'
  }
];

export class MockWorkflowService {
  errorMode = false;

  public promptCancelWorkflow: EventEmitter<string> = new EventEmitter();

  startWorkflow(): Observable<WorkflowExecution> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock startWorkflow throws error'));
        })
      );
    }
    return of(mockWorkflowExecution).pipe(delay(1));
  }

  cancelThisWorkflow(): Observable<void> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock cancelThisWorkflow throws error'));
        })
      );
    }
    return of(void 0).pipe(delay(1));
  }

  getLastDatasetExecution(): Observable<WorkflowExecution> {
    if (this.errorMode) {
      return throwError(new Error('mock getLastDatasetExecution throws error'));
    }
    return of(mockWorkflowExecution);
  }

  getAllExecutionsCollectingPages(): Observable<WorkflowExecution[]> {
    if (this.errorMode) {
      return throwError(new Error('mock getAllExecutionsCollectingPages throws error'));
    }
    return of(mockWorkflowExecutionResults.results);
  }

  getIsIncrementalHarvestAllowed(_: string): Observable<boolean> {
    return of(true).pipe(delay(1));
  }

  getCompletedDatasetExecutionsUptoPage(): Observable<MoreResults<WorkflowExecution>> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock getCompletedDatasetExecutionsUptoPage throws error'));
        })
      );
    }
    return of({ results: mockWorkflowExecutionResults.results, more: false }).pipe(delay(1));
  }

  getCompletedDatasetOverviewsUptoPage(): Observable<MoreResults<DatasetOverview>> {
    if (this.errorMode) {
      return throwError(new Error('mock getCompletedDatasetOverviewsUptoPage throws error'));
    }
    return of({ results: mockDatasetOverviewResults.results, more: false });
  }

  getFinishedDatasetExecutions(_: string, __?: number): Observable<Results<WorkflowExecution>> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(
            new HttpErrorResponse({
              error: 'err',
              status: 404,
              statusText: 'Error: getFinishedDatasetExecutions'
            })
          );
        })
      );
    }
    return of(mockWorkflowExecutionResults);
  }

  getDatasetHistory(datasetId: string): Observable<WorkflowExecutionHistoryList> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getDatasetHistory(${datasetId}) throws error`));
        })
      );
    }
    return of({
      executions: mockWorkflowExecutionResults.results.map((we: WorkflowExecution) => {
        return {
          workflowExecutionId: we.id,
          startedDate: we.startedDate,
          startedBy: we.startedBy
        };
      })
    }).pipe(delay(1));
  }

  getExecutionPlugins(id: string): Observable<PluginAvailabilityList> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock getExecutionPlugins(${id}) throws error`));
        })
      );
    }
    return of({
      plugins: [
        { pluginType: PluginType.HTTP_HARVEST, canDisplayRawXml: true },
        { pluginType: PluginType.VALIDATION_EXTERNAL, canDisplayRawXml: true },
        { pluginType: PluginType.TRANSFORMATION, canDisplayRawXml: true },
        { pluginType: PluginType.VALIDATION_INTERNAL, canDisplayRawXml: true },
        { pluginType: PluginType.NORMALIZATION, canDisplayRawXml: false }
      ]
    }).pipe(delay(1));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  promptCancelThisWorkflow(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getReportsForExecution(): void {}

  getWorkflowSamples(): Observable<XmlSample[]> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(
            new HttpErrorResponse({
              error: 'err',
              status: 500,
              statusText: 'Error: getWorkflowSamples'
            })
          );
        })
      );
    }
    return of(mockXmlSamples).pipe(delay(1));
  }

  getReport(_: string, __: string): Observable<Report> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock getReport throws error...'));
        })
      );
    }
    return of(mockReport).pipe(delay(1));
  }

  getVersionHistory(): Observable<HistoryVersion[]> {
    if (this.errorMode) {
      return throwError(new Error('mock getVersionHistory throws error...'));
    }
    return of(mockHistoryVersions).pipe(delay(1));
  }

  searchWorkflowRecordsById(_: string, __: PluginType, id: string): Observable<XmlSample> {
    if (this.errorMode) {
      return throwError(new Error('mock searchWorkflowRecordsById throws error...'));
    }
    if (id === 'zero') {
      return of((null as unknown) as XmlSample);
    }
    return of(mockXmlSamples[0]);
  }

  getWorkflowRecordsById(_: string, __: PluginType, ids: Array<string>): Observable<XmlSample[]> {
    if (this.errorMode) {
      return throwError(new Error('mock getWorkflowRecordsById throws error...'));
    }
    if (ids.length === 1 && ids[0] === 'zero') {
      return of([]);
    }
    return of(mockXmlSamples);
  }

  getRecordFromPredecessor(_: string, __: PluginType, ids: Array<string>): Observable<XmlSample[]> {
    if (this.errorMode) {
      return throwError(new Error('mock getWorkflowRecordsById throws error...'));
    }
    return this.getWorkflowRecordsById(_, __, ids);
  }

  getStatistics(): Observable<Statistics> {
    return of(mockStatistics);
  }

  getStatisticsDetail(): Observable<NodePathStatistics> {
    if (this.errorMode) {
      return throwError(new Error('mock getStatisticsDetail throws error'));
    }
    return of(mockStatisticsDetail).pipe(delay(1));
  }

  getWorkflowForDataset(): Observable<Workflow> {
    if (this.errorMode) {
      return throwError(new Error('mock getWorkflowForDataset throws error'));
    }
    return of(mockWorkflow);
  }

  createWorkflowForDataset(): Observable<Workflow> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock createWorkflowForDataset throws error'));
        })
      );
    }
    return of(mockWorkflow).pipe(delay(1));
  }

  getPublishedHarvestedData(): Observable<HarvestData> {
    if (this.errorMode) {
      return throwError(new Error('mock getPublishedHarvestedData throws error'));
    }
    return of(mockHarvestData);
  }

  getLogs(): Observable<SubTaskInfo[]> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error('mock getLogs throws error'));
        })
      );
    }
    return of(mockLogs).pipe(delay(1));
  }
}

export class MockWorkflowServiceErrors extends MockWorkflowService {
  errorMode = true;
}
