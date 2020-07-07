import { Observable, of as observableOf, throwError } from 'rxjs';
import { DepublicationStatus, MoreResults, RecordDepublicationInfo, Results } from '../_models';

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

export const mockPublicationInfoResults: Results<RecordDepublicationInfo> = {
  results: mockPublicationInfo,
  listSize: 2,
  nextPage: -1
};

export const mockPublicationInfoMoreResults: MoreResults<RecordDepublicationInfo> = {
  results: mockPublicationInfo,
  more: false,
  maxResultCountReached: true
};

export class MockDepublicationService {
  errorMode = false;

  getPublicationInfoUptoPage(
    datasetId: string,
    _: number
  ): Observable<MoreResults<RecordDepublicationInfo>> {
    if (this.errorMode) {
      return throwError(`mock getPublicationInfoUptoPage(${datasetId}) throws error...`);
    }
    return observableOf(mockPublicationInfoMoreResults);
  }

  deleteDepublications(datasetId: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(`mock deleteDepublications(${datasetId}) throws error...`);
    }
    return observableOf(true);
  }

  depublishDataset(datasetId: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(`mock depublishDataset(${datasetId}) throws error...`);
    }
    return observableOf(true);
  }

  depublishRecordIds(datasetId: string, recordIds: Array<string>): Observable<boolean> {
    if (this.errorMode) {
      return throwError(`mock depublishRecordIds(${datasetId}, ${recordIds}) throws error...`);
    }
    return observableOf(true);
  }

  setPublicationFile(datasetId: string, file: File): Observable<boolean> {
    if (this.errorMode) {
      return throwError(`mock setPublicationFile(${datasetId}, ${file}) throws error...`);
    }
    return observableOf(true);
  }

  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    if (this.errorMode) {
      return throwError(`mock setPublicationInfo(${datasetId}, ${toDepublish}) throws error...`);
    }
    return observableOf(true);
  }
}

export class MockDepublicationServiceErrors extends MockDepublicationService {
  errorMode = true;
}
