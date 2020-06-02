import { Observable, of as observableOf, throwError } from 'rxjs';
import { MoreResults, RecordPublicationInfo, Results } from '../_models';

export const mockPublicationInfo = [
  {
    id: '1',
    recordUrl: 'http://123',
    publicationStatus: 'PUBLISHED',
    depublicationDate: '2019-02-18T07:36:59.801Z'
  },
  {
    id: '2',
    recordUrl: 'http://abc/123',
    publicationStatus: 'DEPUBLISHED',
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
    console.log(`Mock: setPublicationFile ${datasetId}/${file}`);
    return observableOf(true);
  }

  setPublicationInfo(datasetId: string, toDepublish: string): Observable<boolean> {
    console.log(`Mock: setPublicationInfo ${datasetId}/${toDepublish}`);
    return observableOf(true);
  }
}

export class MockDepublicationServiceErrors extends MockDepublicationService {
  errorMode = true;
}
