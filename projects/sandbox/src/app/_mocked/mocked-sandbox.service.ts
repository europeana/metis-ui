import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { mockDatasetInfo } from '.';
import { DatasetInfo, DatasetInfoStatus, SubmissionResponseData } from '../_models';

export class MockSandboxService {
  errorMode = false;

  requestProgress(_: string): Observable<DatasetInfo> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock requestProgress throws error`));
        })
      );
    }
    const res = Object.assign({}, mockDatasetInfo);
    res.status = DatasetInfoStatus.COMPLETED;
    return of(res).pipe(delay(1));
  }

  submitDataset(
    datasetName: string,
    country: string,
    language: string,
    fileFormName: string,
    file: File
  ): Observable<SubmissionResponseData> {
    console.log(
      `mock submitDataset(${datasetName}, ${country}, ${language}, ${fileFormName}, ${!!file})`
    );
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(new Error(`mock submitDataset throws error`));
        })
      );
    }
    return of({
      body: {
        'dataset-id': 1,
        'records-to-process': 1,
        'duplicate-records': 0
      }
    }).pipe(delay(1));
  }
}

export class MockSandboxServiceErrors extends MockSandboxService {
  errorMode = true;
}