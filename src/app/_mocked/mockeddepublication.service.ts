import { Observable, of as observableOf, throwError } from 'rxjs';
import { DepublicationStatus, MoreResults, RecordPublicationInfo, Results } from '../_models';

export const mockPublicationInfo = [
  {
    id: '1',
    recordId: 'http://123',
    depublicationStatus: DepublicationStatus.PENDING,
    depublicationDate: '2019-02-18T07:36:59.801Z'
  },
  {
    id: '2',
    recordId: 'http://abc/123',
    depublicationStatus: DepublicationStatus.DEPUBLISHED,
    depublicationDate: '2019-02-18T07:36:59.801Z'
  }
] as Array<RecordPublicationInfo>;

export const mockPublicationInfoResults: Results<RecordPublicationInfo> = {
  results: mockPublicationInfo,
  listSize: 2,
  nextPage: -1
};

export const mockPublicationInfoMoreResults: MoreResults<RecordPublicationInfo> = {
  results: mockPublicationInfo,
  more: false,
  maxResultCountReached: true
};

export class MockDepublicationService {
  errorMode = false;

  getPublicationInfoUptoPage(
    datasetId: string,
    endPage: number
  ): Observable<MoreResults<RecordPublicationInfo>> {
    if (this.errorMode) {
      console.log('mock getPublicationInfoUptoPage throws error...');
      return throwError('mock getPublicationInfoUptoPage throws error...');
    }
    console.log('TODO: eslint-disable no-unused-vars >>> ' + datasetId + ' ' + endPage);
    return observableOf(mockPublicationInfoMoreResults);
  }

  setPublicationFile(datasetId: string, file: File): Observable<boolean> {
    if (this.errorMode) {
      console.log('mock setPublicationFile errors...');
      return observableOf(false);
    }
    console.log(`Mock: setPublicationFile ${datasetId}/${file}`);
    return observableOf(true);
  }

  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    if (this.errorMode) {
      console.log('mock setPublicationInfo throws error...');
      return throwError('mock setPublicationInfo throws error...');
    }
    console.log(`Mock: setPublicationInfo ${datasetId}/${toDepublish}`);
    return observableOf(true);
  }
}

export class MockDepublicationServiceErrors extends MockDepublicationService {
  errorMode = true;
}
