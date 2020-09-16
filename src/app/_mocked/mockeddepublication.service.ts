import { HttpEvent } from '@angular/common/http';
import { Observable, of as observableOf, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

import { DatasetDepublicationInfo, DepublicationStatus, RecordDepublicationInfo } from '../_models';

export const mockPublicationInfo = [
  {
    recordId: 'http://123',
    depublicationStatus: DepublicationStatus.PENDING,
    depublicationDate: '2019-02-18T07:36:59.801Z'
  },
  {
    recordId: 'http://abc/123',
    depublicationStatus: DepublicationStatus.DEPUBLISHED,
    depublicationDate: '2019-02-18T07:36:59.801Z'
  }
] as Array<RecordDepublicationInfo>;

export const mockPublicationInfoResults: DatasetDepublicationInfo = {
  depublicationRecordIds: {
    results: mockPublicationInfo,
    listSize: 2,
    nextPage: -1
  },
  depublicationTriggerable: true
};

export const mockPublicationInfoMoreResults: DatasetDepublicationInfo = {
  depublicationRecordIds: {
    results: mockPublicationInfo,
    listSize: 2,
    nextPage: -1
  },
  depublicationTriggerable: true
};

export class MockDepublicationService {
  errorMode = false;

  handleUploadEvents(event: HttpEvent<Object>): boolean {
    console.log(`mock handleUploadEvents (${event})`);
    return true;
  }

  getPublicationInfoUptoPage(datasetId: string, _: number): Observable<DatasetDepublicationInfo> {
    if (this.errorMode) {
      return throwError(new Error(`mock getPublicationInfoUptoPage(${datasetId}) throws error...`));
    }
    return observableOf(mockPublicationInfoMoreResults);
  }

  deleteDepublications(datasetId: string, recordIds: Array<string>): Observable<boolean> {
    if (this.errorMode) {
      return throwError(
        new Error(`mock deleteDepublications(${datasetId}, ${recordIds}) throws error...`)
      );
    }
    return observableOf(true);
  }

  depublishDataset(datasetId: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(new Error(`mock depublishDataset(${datasetId}) throws error...`));
    }
    return observableOf(true);
  }

  depublishRecordIds(datasetId: string, recordIds: Array<string>): Observable<boolean> {
    if (this.errorMode) {
      return throwError(
        new Error(`mock depublishRecordIds(${datasetId}, ${recordIds}) throws error...`)
      );
    }
    return observableOf(true);
  }

  setPublicationFile(datasetId: string, file: File): Observable<boolean> {
    if (this.errorMode) {
      return timer(1).pipe(
        switchMap(() => {
          return throwError(
            new Error(`mock setPublicationFile(${datasetId}, ${file}) throws error...`)
          );
        })
      );
    }
    return observableOf(true).pipe(delay(1));
  }

  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(
        new Error(`mock setPublicationInfo(${datasetId}, ${toDepublish}) throws error...`)
      );
    }
    return observableOf(true);
  }
}

export class MockDepublicationServiceErrors extends MockDepublicationService {
  errorMode = true;
}
