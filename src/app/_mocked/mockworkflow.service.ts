import { WorkflowService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentWorkflow = { 
  results: [{ 
    workflowName: 'mocked',
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
  workflowName: 'mocked',
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
  workflowName: 'mocked',
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
  workflowName: 'mocked',
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
    workflowName: 'mocked',
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
    }
  }],  
  nextPage: -1
};

export let XMLSamples = [{ 
 'ecloudId': 1,
 'xmlRecord': '<?xml version="1.0" encoding="UTF-8"?>'
}];

export let currentReport = { id: 123, 
  errors: [{errorType: 'errorType', 
    message: 'errorMessage', 
    occurrences: 9, 
    identifiers: []
  }]
};

export let currentDataset = { 
    datasetId: '1'
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
  
  getOngoingExecutionsPerOrganisation() {
    return Observable.of(currentWorkflow['results']);
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
}
