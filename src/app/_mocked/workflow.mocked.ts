import { WorkflowService } from '../_services';
import { HttpClientModule } from '@angular/common/http';

export class MockWorkflowService extends WorkflowService {

  mockedDataset: any = { 
    country: {},
    createdByUserId: '',
    createdDate: '',
    dataProvider: '',
    datasetId: '',
    datasetName: '',
    description:'',
    ecloudDatasetId: '',
    harvestingMetadata: {},
    id: '',
    intermediateProvider: '',
    language: {},
    notes: '',
    organizationId: '',
    organizationName: '',
    provider: '',
    replacedBy: '',
    replaces: '',
    updatedDate: ''
  }

  mockedWorkflow: any = 
    {
      "results": [],
      "listSize": 5,
      "nextPage": 1
  };

  super(http: HttpClientModule) { }

  getAllExecutions(id, page?, workflow?) {
    return this.mockedWorkflow;
  }

  getWorkflows() {
    let workflows = ['mocked'];
    return workflows ;
  }

  getCurrentPage() {
    return 1;
  }

}
