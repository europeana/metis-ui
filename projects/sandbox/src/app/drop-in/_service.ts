import { Injectable } from '@angular/core';
import { getEnvVar } from 'shared';
import { Observable, of, switchMap } from 'rxjs';
import { UserDatasetInfo } from '../_models';
import { DropInModel } from './_model';
import { RenameStatusPipe, RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  renameHarvestProtocolPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();

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
      const status = this.renameStatusPipe.transform(item['status']);
      return {
        id: {
          value: item['dataset-id']
        },
        name: {
          value: item['dataset-name']
        },
        date: {
          value: item['creation-date']
        },
        description: {
          value: [
            `(${item['processed-records']} / ${item['total-records']})`,
            `(${item.country} / ${item.language})`
          ].join(', ')
        },
        'harvest-protocol': {
          value: protocol
        },
        status: {
          value: status
        }
      };
    });
    return of(res);
  }
}
