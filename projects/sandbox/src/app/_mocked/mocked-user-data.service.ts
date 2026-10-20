import { signal, WritableSignal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mockUserDatasets } from './'; // Assumed to be Array<UserDatasetInfo>
import { DropInModel, UserDatasetInfo } from '../_models';

export class MockUserDataService {
  public readonly signalUserDatasetModel: WritableSignal<Array<DropInModel>> = signal([]);
  public readonly loading: WritableSignal<boolean> = signal(false);

  public getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return of([]);
  }

  public getUserDatasets(): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets ?? []);
  }

  public prependUserDataset(_id: string): void {}
  public pauseUserDatsetPoller(): void {}
  public refreshUserDatasetPoller(): void {}
  public cleanup(): void {}
}
