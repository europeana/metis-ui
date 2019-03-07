import { EventEmitter } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';

import {
  HarvestData,
  HistoryVersion,
  MoreResults,
  PluginExecution,
  PluginStatus,
  Report,
  ReportAvailability,
  Results,
  Statistics,
  SubTaskInfo,
  TaskState,
  Workflow,
  WorkflowExecution,
  WorkflowStatus,
  XmlSample,
} from '../_models';

export const mockHistoryVersions: Array<HistoryVersion> = [
  {
    workflowId: 1,
    pluginType: 'OAIPMH_HARVEST',
  },
  {
    workflowId: 1,
    pluginType: 'VALIDATION_EXTERNAL',
  },
  {
    workflowId: 1,
    pluginType: 'TRANSFORMATION',
  },
];

export const mockWorkflow: Workflow = {
  datasetId: '1',
  id: '1',
  metisPluginsMetadata: [
    {
      enabled: true,
      metadataFormat: 'edm',
      pluginType: 'OAIPMH_HARVEST',
      setSpec: 'oai_test',
      url: 'http://www.mocked.com',
    },
    {
      enabled: true,
      pluginType: 'TRANSFORMATION',
      customXslt: false,
    },
    {
      enabled: true,
      pluginType: 'MEDIA_PROCESS',
    },
    {
      enabled: true,
      pluginType: 'LINK_CHECKING',
    },
  ],
};

export const mockWorkflowExecutionResults: Results<WorkflowExecution> = {
  results: [
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.INQUEUE,
      createdDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '',
      startedDate: '',
      metisPlugins: [
        {
          pluginType: 'NORMALIZATION',
          id: '432552345',
          startedDate: '2018-11-05T15:38:18.450Z',
          updatedDate: '2018-11-05T15:38:18.450Z',
          pluginMetadata: {
            pluginType: 'NORMALIZATION',
            mocked: true,
            enabled: false,
          },
          pluginStatus: PluginStatus.INQUEUE,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.SENT,
          },
        },
      ],
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.RUNNING,
      createdDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '',
      startedDate: '',
      metisPlugins: [
        {
          pluginType: 'NORMALIZATION',
          id: '432552345',
          startedDate: '2018-11-05T15:38:18.450Z',
          updatedDate: '2018-11-05T15:38:18.450Z',
          pluginMetadata: {
            pluginType: 'NORMALIZATION',
            mocked: true,
            enabled: false,
          },
          pluginStatus: PluginStatus.RUNNING,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED,
          },
        },
      ],
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.FAILED,
      createdDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '',
      startedDate: '',
      metisPlugins: [
        {
          pluginType: 'NORMALIZATION',
          id: '432552345',
          startedDate: '2018-11-05T15:38:18.450Z',
          updatedDate: '2018-11-05T15:38:18.450Z',
          pluginMetadata: {
            pluginType: 'NORMALIZATION',
            mocked: true,
            enabled: false,
          },
          pluginStatus: PluginStatus.FAILED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED,
          },
        },
      ],
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.CANCELLED,
      createdDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '',
      startedDate: '',
      metisPlugins: [
        {
          pluginType: 'NORMALIZATION',
          id: '432552345',
          startedDate: '2018-11-05T15:38:18.450Z',
          updatedDate: '2018-11-05T15:38:18.450Z',
          pluginMetadata: {
            pluginType: 'NORMALIZATION',
            mocked: true,
            enabled: false,
          },
          pluginStatus: PluginStatus.CANCELLED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED,
          },
        },
      ],
    },
    {
      id: '253453453',
      datasetId: '5323465',
      workflowStatus: WorkflowStatus.FINISHED,
      createdDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '',
      startedDate: '',
      metisPlugins: [
        {
          pluginType: 'NORMALIZATION',
          id: '432552345',
          startedDate: '2018-11-05T15:38:18.450Z',
          updatedDate: '2018-11-05T15:38:18.450Z',
          pluginMetadata: {
            pluginType: 'NORMALIZATION',
            mocked: true,
            enabled: false,
          },
          pluginStatus: PluginStatus.FINISHED,
          externalTaskId: '123',
          topologyName: 'normalization',
          executionProgress: {
            processedRecords: 1000,
            expectedRecords: 1000,
            progressPercentage: 100,
            errors: 0,
            status: TaskState.PROCESSED,
          },
        },
      ],
    },
  ],
  listSize: 5,
  nextPage: -1,
};

export const mockFirstPageResults: Results<WorkflowExecution> = {
  ...mockWorkflowExecutionResults,
  nextPage: 1,
};

export const mockWorkflowExecution: WorkflowExecution = mockWorkflowExecutionResults.results[0];

export const mockPluginExecution: PluginExecution = mockWorkflowExecution.metisPlugins[0];

export const mockXmlSamples: XmlSample[] = [
  {
    ecloudId: '1',
    xmlRecord: '<?xml version="1.0" encoding="UTF-8"?>',
  },
];

export const mockStatistics: Statistics = {
  taskId: 5,
  nodeStatistics: [
    {
      attributesStatistics: [
        {
          name: '//rdf:RDF/edm:ProvidedCHO/dc:creator/@xml:lang',
          occurrence: 2,
          value: 'ca',
        },
      ],
      occurrence: 2,
      parentXpath: '//rdf:RDF/edm:ProvidedCHO',
      value: 'desconegut',
      xpath: '//rdf:RDF/edm:ProvidedCHO/dc:creator',
    },
  ],
};

export const mockReport: Report = {
  id: 123,
  errors: [
    {
      errorType: 'errorType',
      message: 'errorMessage',
      occurrences: 9,
      errorDetails: [],
    },
  ],
};

export const mockReportAvailability: ReportAvailability = {
  existsExternalTaskReport: true,
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
};

export const mockLogs = [
  {
    resourceNum: 5,
    resource: 'dsv',
    state: 'st',
    info: 'fdsfsd',
    resultResource: 'xcsdc',
  },
];

export class MockWorkflowService {
  public promptCancelWorkflow: EventEmitter<string> = new EventEmitter();

  startWorkflow(): Observable<WorkflowExecution> {
    return observableOf(mockWorkflowExecution);
  }

  cancelThisWorkflow(): Observable<void> {
    return observableOf(undefined);
  }

  getLastDatasetExecution(): Observable<WorkflowExecution> {
    return observableOf(mockWorkflowExecution);
  }

  getAllExecutionsCollectingPages(): Observable<WorkflowExecution[]> {
    return observableOf(mockWorkflowExecutionResults.results);
  }

  getAllExecutionsUptoPage(): Observable<MoreResults<WorkflowExecution>> {
    return observableOf({ results: mockWorkflowExecutionResults.results, more: false });
  }

  getCompletedDatasetExecutionsUptoPage(): Observable<MoreResults<WorkflowExecution>> {
    return observableOf({ results: mockWorkflowExecutionResults.results, more: false });
  }

  getFinishedDatasetExecutions(): Observable<Results<WorkflowExecution>> {
    return observableOf(mockWorkflowExecutionResults);
  }

  getDatasetExecutionsCollectingPages(): Observable<WorkflowExecution[]> {
    return observableOf(mockWorkflowExecutionResults.results);
  }

  promptCancelThisWorkflow(): void {}

  getReportsForExecution(): void {}

  getWorkflowSamples(): Observable<XmlSample[]> {
    return observableOf(mockXmlSamples);
  }

  getReport(_: string, __: string): Observable<Report> {
    return observableOf(mockReport);
  }

  getVersionHistory(): Observable<HistoryVersion[]> {
    return observableOf(mockHistoryVersions);
  }

  getStatistics(): Observable<Statistics> {
    return observableOf(mockStatistics);
  }

  getWorkflowForDataset(): Observable<Workflow> {
    return observableOf(mockWorkflow);
  }

  createWorkflowForDataset(): Observable<Workflow> {
    return observableOf(mockWorkflow);
  }

  getPublishedHarvestedData(): Observable<HarvestData> {
    return observableOf(mockHarvestData);
  }

  getLogs(): Observable<SubTaskInfo[]> {
    return observableOf(mockLogs);
  }

  getWorkflowCancelledBy(): Observable<string | undefined> {
    return observableOf(undefined);
  }
}
