import { Observable, of } from 'rxjs';
import { mockDatasetInfo } from '.';
import { DatasetInfo, SubmissionResponseData } from '../_models';

export class MockSandboxService {
  requestProgress(_: string): Observable<DatasetInfo> {
    return of(mockDatasetInfo);
  }

  submitDataset(
    datasetName: string,
    country: string,
    language: string,
    fileFormName: string,
    file: File
  ): Observable<SubmissionResponseData> {
    console.log(
      `Mock submitDataset(${datasetName}, ${country}, ${language}, ${fileFormName}, ${!!file})`
    );
    return of({
      body: {
        'dataset-id': 1,
        'records-to-process': 1,
        'duplicate-records': 0
      }
    });
  }
}
