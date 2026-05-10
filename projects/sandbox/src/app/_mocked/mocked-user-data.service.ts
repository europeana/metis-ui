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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  prependUserDatset(_: string): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pauseUserDatsetPoller(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshUserDatsetPoller(): void {}
}
