import { ModelSignal } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { DropInService } from '../_services';
import { DropInModel, UserDatasetInfo } from '../_models';
import { mockUserDatasets } from '.';

export class MockDropInService extends DropInService {
  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets);
  }

  getDropInModel2(signal: ModelSignal<Array<DropInModel>>): void {
    this.getUserDatsets()
      .pipe(
        switchMap((infos: Array<UserDatasetInfo>) => {
          return this.mapToDropIn(infos);
        })
      )
      .subscribe((res: Array<DropInModel>) => {
        signal.set(res);
      });
  }
}
