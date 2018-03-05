import { DatasetsService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentDataset = { 
    datasetId: '1',
    harvestingMetadata: 
      { pluginType: 'mocked', 
        mocked: false, 
        revisionNamePreviousPlugin: null, 
        revisionTimestampPreviousPlugin: null, 
        url: 'test'
       }
  }

export class MockDatasetService extends DatasetsService {

}
