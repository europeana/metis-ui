import { WorkflowService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentWorkflowDataset = {
  datasetId: '1',
  id: 1,
  metisPluginsMetadata: [{
    enabled: true,
    metadataFormat: 'edm',
    pluginType: 'OAIPMH_HARVEST',
    setSpec: 'oai_test',
    url: 'http://www.mocked.com'
  },
  {
    enabled: true,
    pluginType: 'HTTP_HARVEST',
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
}

export let currentWorkflow = { 
  results: [{ 
    workflowStatus: 'INQUEUE',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'INQUEUE',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  },
  {
    workflowStatus: 'RUNNING',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'RUNNING',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  },
  {
    workflowStatus: 'FAILED',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'FAILED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  },
  {
    workflowStatus: 'CANCELLED',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'FAILED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  },
  { 
    workflowStatus: 'FINISHED',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'FINISHED',
      externalTaskId: '123',
      topologyName: 'mocked',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  }],  
  nextPage: -1
};

export let XMLSamples = [{ 
 'ecloudId': 1,
 'xmlRecord': '<?xml version="1.0" encoding="UTF-8"?>'
}];

export let statistics = { nodeStatistics: 
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

export let currentReport = { id: 123, 
  errors: [{errorType: 'errorType', 
    message: 'errorMessage', 
    occurrences: 9, 
    identifiers: []
  }]
};

export let harvestData = {
  'firstPublishedDate': '2018-03-28T13:53:04.762Z',
  'lastPublishedDate': '2018-03-30T13:53:04.762Z',
  'lastPublishedRecords': 842,
  'lastHarvestedDate': '2018-03-30T13:53:04.762Z',
  'lastHarvestedRecords': 842
}


export class MockWorkflowService extends WorkflowService {
  
  triggerNewWorkflow() {
    return Observable.of(currentWorkflow['results'][0]);
  }

  cancelThisWorkflow() {
    return Observable.of(false);
  }

  getAllExecutions() {
    return Observable.of(currentWorkflow);
  }

  getLastExecution() {
    return Observable.of(currentWorkflow['results'][0]);
  }

  setActiveWorkflow(workflow?): void {
    this.changeWorkflow.emit(currentWorkflow['results'][0]);
  }
  
  getAllExecutionsPerOrganisation() {
    return Observable.of(currentWorkflow);
  }

  getAllFinishedExecutions() {
    return Observable.of(currentWorkflow);
  }

  getWorkflowSamples() {
    return Observable.of(XMLSamples);
  }

  getReport(taskid, topology) {
    return Observable.of(currentReport);
  }

  getCurrentReport() {
    return currentReport;
  }

  getStatistics() {
    return Observable.of(statistics);
  }

  getWorkflowForDataset() {
    return Observable.of(currentWorkflowDataset);
  }

  createWorkflowForDataset() {
    return Observable.of(currentWorkflowDataset);
  }

  getPublishedHarvestedData() {
    return Observable.of(harvestData);
  }

  getLogs() {
    return Observable.of('mocked');
  }
}
