import { WorkflowService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentWorkflow = { 
    workflowName: 'mocked',
    workflowStatus: 'RUNNING',
    updatedDate: '',
    startedDate: '',
    metisPlugins: [{
      pluginStatus: 'RUNNING',
      executionProgress: {
        processedRecords: '1000',
        expectedRecords: '1000'
      }
    }]
  }

export let currentDataset = { 
    datasetId: '1'
  }

export class MockWorkflowService extends WorkflowService {
  
  cancelThisWorkflow() {
    return Observable.of(false);
  }

  getLastExecution() {
    return Observable.of(currentWorkflow);
  }

  setActiveWorkflow(workflow?): void {
    this.changeWorkflow.emit(currentWorkflow);
  }

  getOngoingExecutionsPerOrganisation() {
    return Observable.of([currentWorkflow]);
  }

}