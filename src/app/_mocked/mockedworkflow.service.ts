import {of as observableOf,  Observable } from 'rxjs';
import { WorkflowService } from '../_services';
import { Workflow } from '../_models/workflow';
import { Results } from '../_models/results';
import { WorkflowExecution } from '../_models/workflow-execution';
import { XmlSample } from '../_models/xml-sample';
import { Report } from '../_models/report';
import { HarvestData } from '../_models/harvest-data';
import { Statistics } from '../_models/statistics';
import { SubTaskInfo } from '../_models/subtask-info';

export const currentWorkflowDataset: Workflow = {
  datasetId: '1',
  id: '1',
  metisPluginsMetadata: [{
    enabled: true,
    metadataFormat: 'edm',
    pluginType: 'OAIPMH_HARVEST',
    setSpec: 'oai_test',
    url: 'http://www.mocked.com'
  },
  {
    enabled: true,
    pluginType: 'TRANSFORMATION',
    customXSLT: false
  },
  {
    enabled: true,
    pluginType: 'MEDIA_PROCESS',
    connectionLimitToDomains: { 'mocked': 1 }
  },
  {
    enabled: true,
    pluginType: 'LINK_CHECKING',
    connectionLimitToDomains: { 'mocked': 1 }
  }]
};

export const currentWorkflow: Results<WorkflowExecution[]> = {
  results: [{
    id: '253453453',
    datasetId: '5323465',
    workflowStatus: 'INQUEUE',
    createdDate: '2018-11-05T15:38:18.450Z',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      id: '432552345',
      startedDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '2018-11-05T15:38:18.450Z',
      pluginMetadata: { pluginType: 'mocked', mocked: true, enabled: false },
      pluginStatus: 'INQUEUE',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: 1000,
        expectedRecords: 1000,
        progressPercentage: 100,
        errors: 0,
        status: 'DONE'
      }
    }]
  },
  {
    id: '253453453',
    datasetId: '5323465',
    workflowStatus: 'RUNNING',
    createdDate: '2018-11-05T15:38:18.450Z',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      id: '432552345',
      startedDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '2018-11-05T15:38:18.450Z',
      pluginMetadata: { pluginType: 'mocked', mocked: true, enabled: false },
      pluginStatus: 'RUNNING',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: 1000,
        expectedRecords: 1000,
        progressPercentage: 100,
        errors: 0,
        status: 'DONE'
      }
    }]
  },
  {
    id: '253453453',
    datasetId: '5323465',
    workflowStatus: 'FAILED',
    createdDate: '2018-11-05T15:38:18.450Z',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      id: '432552345',
      startedDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '2018-11-05T15:38:18.450Z',
      pluginMetadata: { pluginType: 'mocked', mocked: true, enabled: false },
      pluginStatus: 'FAILED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: 1000,
        expectedRecords: 1000,
        progressPercentage: 100,
        errors: 0,
        status: 'DONE'
      }
    }]
  },
  {
    id: '253453453',
    datasetId: '5323465',
    workflowStatus: 'CANCELLED',
    createdDate: '2018-11-05T15:38:18.450Z',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      id: '432552345',
      startedDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '2018-11-05T15:38:18.450Z',
      pluginMetadata: { pluginType: 'mocked', mocked: true, enabled: false },
      pluginStatus: 'FAILED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: 1000,
        expectedRecords: 1000,
        progressPercentage: 100,
        errors: 0,
        status: 'DONE'
      }
    }]
  },
  {
    id: '253453453',
    datasetId: '5323465',
    workflowStatus: 'FINISHED',
    createdDate: '2018-11-05T15:38:18.450Z',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      id: '432552345',
      startedDate: '2018-11-05T15:38:18.450Z',
      updatedDate: '2018-11-05T15:38:18.450Z',
      pluginMetadata: { pluginType: 'mocked', mocked: true, enabled: false },
      pluginStatus: 'FINISHED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: 1000,
        expectedRecords: 1000,
        progressPercentage: 100,
        errors: 0,
        status: 'DONE'
      }
    }]
  }],
  listSize: 5,
  nextPage: -1
};

export const xmlSamples: XmlSample[] = [{
  ecloudId: '1',
  xmlRecord: '<?xml version="1.0" encoding="UTF-8"?>'
}];

export const statistics: Statistics = { nodeStatistics:
  [{attributesStatistics:
      [{name: '//rdf:RDF/edm:ProvidedCHO/dc:creator/@xml:lang',
        occurrence: 2,
        value: 'ca'
      }],
    occurrence: 2,
    parentXpath: '//rdf:RDF/edm:ProvidedCHO',
    value: 'desconegut',
    xpath: '//rdf:RDF/edm:ProvidedCHO/dc:creator'
  }]
};

export const currentReport: Report = {
  id: '123',
  errors: [
    {
      errorType: 'errorType',
      message: 'errorMessage',
      occurrences: 9,
      identifiers: []
    }
  ]
};

export const harvestData: HarvestData = {
  lastPreviewDate: '2018-03-28T13:53:04.762Z',
  lastPreviewRecords: 842,
  lastPreviewRecordsReadyForViewing: true,
  firstPublishedDate: '2018-03-28T13:53:04.762Z',
  lastPublishedDate: '2018-03-30T13:53:04.762Z',
  lastPublishedRecords: 842,
  lastPublishedRecordsReadyForViewing: true,
  lastHarvestedDate: '2018-03-30T13:53:04.762Z',
  lastHarvestedRecords: 842
};

export class MockWorkflowService extends WorkflowService {

  triggerNewWorkflow(): Observable<WorkflowExecution> {
    return observableOf(currentWorkflow.results[0]);
  }

  cancelThisWorkflow(): Observable<void> {
    return observableOf(undefined);
  }

  getAllExecutions(): Observable<Results<WorkflowExecution[]>> {
    return observableOf(currentWorkflow);
  }

  getAllExecutionsEveryStatus(): Observable<Results<WorkflowExecution[]>> {
    return observableOf(currentWorkflow);
  }

  getLastExecution(): Observable<WorkflowExecution> {
    return observableOf(currentWorkflow.results[0]);
  }

  setActiveWorkflow(workflow?: WorkflowExecution): void {
    this.changeWorkflow.emit(currentWorkflow.results[0]);
  }

  getAllExecutionsPerOrganisation(): Observable<Results<WorkflowExecution[]>> {
    return observableOf(currentWorkflow);
  }

  getAllFinishedExecutions(): Observable<Results<WorkflowExecution[]>> {
    return observableOf(currentWorkflow);
  }

  getWorkflowSamples(): Observable<XmlSample[]> {
    return observableOf(xmlSamples);
  }

  getReport(taskid: string, topology: string): Observable<Report> {
    return observableOf(currentReport);
  }

  getCurrentReport(): Report {
    return currentReport;
  }

  getStatistics(): Observable<Statistics> {
    return observableOf(statistics);
  }

  getWorkflowForDataset(): Observable<Workflow> {
    return observableOf(currentWorkflowDataset);
  }

  createWorkflowForDataset(): Observable<Workflow> {
    return observableOf(currentWorkflowDataset);
  }

  getPublishedHarvestedData(): Observable<HarvestData> {
    return observableOf(harvestData);
  }

  getLogs(): Observable<SubTaskInfo[]> {
    return observableOf([{ resourceNum: 5, resource: 'dsv', state: 'st', info: 'fdsfsd', resultResource: 'xcsdc' }]);
  }
}
