import { Observable, of } from 'rxjs';
import { mockUserDatasets } from './';
import { DropInModel, UserDatasetInfo } from '../_models';

export class MockUserDataService {
  getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return of([] as Array<DropInModel>);
  }

  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets);
  }

  prependUserDatset(_: string): void {}

  pauseUserDatsetPoller(): void {}

  refreshUserDatsetPoller(): void {}

  cleanup(): void {}
}
