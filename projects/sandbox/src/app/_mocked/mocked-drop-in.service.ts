import { Observable, of } from 'rxjs';
import { mockUserDatasets } from '../_mocked';
import { DropInModel, UserDatasetInfo } from '../_models';
import { DropInService } from '../_services';

export class MockDropInService extends DropInService {
  getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return of([] as Array<DropInModel>);
  }

  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  appendUserDatset(_: string): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pauseUserDatsetPoller(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshUserDatsetPoller(): void {}
}
