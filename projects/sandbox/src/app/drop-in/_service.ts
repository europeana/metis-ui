import { Injectable } from '@angular/core';
import { UserDatasetInfo } from '../_models';
import { mockUserDatasets } from '../_mocked';
import { Observable, of } from 'rxjs';
import { DropInModel } from './_model';
import { RenameStepPipe } from '../_translate';
@Injectable({ providedIn: 'root' })
export class DropInService {
  renameHarvestProtocolPipe = new RenameStepPipe();

  getUserDatsets(_: string): Observable<Array<UserDatasetInfo>> {
    return of(mockUserDatasets);
  }

  getDropInModel(): Observable<Array<DropInModel>> {
    return this.mapToDropIn(mockUserDatasets);
  }

  mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Observable<Array<DropInModel>> {
    console.log('userDatasetInfo: ' + userDatasetInfo);
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
