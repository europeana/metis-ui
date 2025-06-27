import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { getEnvVar } from 'shared';
import { Observable, of, switchMap } from 'rxjs';
import { isoCountryCodes } from '../_data';
import { DatasetStatus, UserDatasetInfo } from '../_models';
import { DropInModel } from './_model';
import { RenameCountryPipe, RenameStatusPipe, RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  renameStepPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();
  renameCountryPipe = new RenameCountryPipe();
  datePipe = new DatePipe('en-US');

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
        name: {
          dropInOpSummaryInclude: true,
          dropInOpHighlight: true,
          value: item['dataset-name']
        },
        date: {
          dropInOpSummaryInclude: true,
          value: item['creation-date'],
          valueOverride: `${this.datePipe.transform(item['creation-date'], 'dd/MM/yyyy')}`,
          tooltip: `${this.datePipe.transform(item['creation-date'], 'HH:mm:ss')}`
        },
        about: {
          dropInOpClass: `flag-orb ${isoCountryCodes[item['country'] as string]}`,
          value: item['language'],
          tooltip: item['country']
        },
        'harvest-protocol': {
          value: protocol
        },
        status: {
          dropInOpClass: statusIcon,
          dropInOpNoWrap: true,
          dropInOpSummaryInclude: true,
          value: status,
          valueOverride: `(${item['processed-records']} / ${item['total-records']})`,
          tooltip: status
        }
      };
    });
    return of(res);
  }
}
