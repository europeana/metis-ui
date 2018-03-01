import { WorkflowService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentWorkflow = { 
  results: [{ 
    workflowName: 'mocked',
    workflowStatus: 'RUNNING',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginType: 'mocked',
      pluginStatus: 'RUNNING',
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

export let currentDataset = { 
    datasetId: '1'
  }

export class MockWorkflowService extends WorkflowService {
  
  cancelThisWorkflow() {
    return Observable.of(false);
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
}



