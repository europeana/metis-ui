import { Injectable } from '@angular/core';
import { getEnvVar } from 'shared';
import { Observable, of, switchMap } from 'rxjs';
import { UserDatasetInfo } from '../_models';
import { DropInModel } from './_model';
import { RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  renameHarvestProtocolPipe = new RenameStepPipe();

  getUserDatsets(_: string): Observable<Array<UserDatasetInfo>> {
    const res = (getEnvVar('test-user-datasets') ?? ([] as unknown)) as Array<UserDatasetInfo>;
    return of(res);
  }

  getDropInModel(): Observable<Array<DropInModel>> {
    return this.getUserDatsets('').pipe(
      switchMap((userDatasets) => {
        return this.mapToDropIn(userDatasets);
      })
    );
  }

  mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Observable<Array<DropInModel>> {
    const res = userDatasetInfo.map((item: UserDatasetInfo) => {
      const protocol = this.renameHarvestProtocolPipe.transform(item['harvest-protocol']);
      return {
        id: item['dataset-id'],
        name: item['dataset-name'],
        date: item['creation-date'],
        description: [
          `(${item['processed-records']} / ${item['total-records']})`,
          `(${item.country} / ${item.language})`
        ].join(', '),
        'harvest-protocol': protocol,
        status: item['status']
      };
    });
    return of(res);
  }
}
