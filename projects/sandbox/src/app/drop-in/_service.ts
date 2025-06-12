import { Injectable } from '@angular/core';
import { getEnvVar } from 'shared';
import { UserDatasetInfo } from '../_models';
import { Observable, of, switchMap } from 'rxjs';
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
    console.log('mapToDropIn userDatasetInfo: ' + userDatasetInfo);

    const res = userDatasetInfo.map((item: UserDatasetInfo) => {
      return {
        id: item['dataset-id'],
        name: item['dataset-name'],
        date: item['creation-date'],
        description: [
          `${item.status} (${item['processed-records']} / ${item['total-records']})`,
          this.renameHarvestProtocolPipe.transform(item['harvest-protocol']),
          `(${item.country} / ${item.language})`
        ].join(', ')
      };
    });
    return of(res);
  }
}
