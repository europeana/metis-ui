import { inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { apiSettings } from '../../environments/apisettings';
import { dropInConfDatasets, isoCountryCodes } from '../_data';
import { DatasetStatus, DropInConfItem, DropInModel, UserDatasetInfo } from '../_models';
import { RenameStatusPipe, RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  private readonly http = inject(HttpClient);

  renameStepPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();
  datePipe = new DatePipe('en-US');

  /** getDropInConf
   *  returns the configuration
   *  currently only 'datasetToTrack' is implemented
   **/
  getUserDatsets(_: string): Observable<Array<UserDatasetInfo>> {
    return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/user-datasets`);
  }

  /** getDropInConf
   *  returns the configuration
   *  currently only 'datasetToTrack' is implemented
   **/
  getDropInConf(_: string): Array<DropInConfItem> {
    return dropInConfDatasets;
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
      const protocol = this.renameStepPipe.transform(item['harvest-protocol'], [true]);
      const status = this.renameStatusPipe.transform(item['status']);
      const statusIcon =
        item['status'] === DatasetStatus.COMPLETED
          ? 'drop-in-tick'
          : item['status'] === DatasetStatus.IN_PROGRESS
          ? 'drop-in-spinner'
          : 'drop-in-cross';

      return {
        id: {
          value: item['dataset-id']
        },
        status: {
          customClass: statusIcon,
          tooltip: status,
          value: status,
          valueOverride: `(${item['processed-records']} / ${item['total-records']})`
        },
        name: {
          value: item['dataset-name']
        },
        'harvest-protocol': {
          value: protocol
        },
        about: {
          customClass: `flag-orb ${isoCountryCodes[item['country'] as string]}`,
          tooltip: item['country'],
          value: item['language']
        },
        date: {
          tooltip: `${this.datePipe.transform(item['creation-date'], 'HH:mm:ss')}`,
          value: item['creation-date'],
          valueOverride: `${this.datePipe.transform(item['creation-date'], 'dd/MM/yyyy')}`
        }
      };
    });
    return of(res);
  }
}
