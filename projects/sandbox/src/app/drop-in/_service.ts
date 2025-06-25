import { Injectable } from '@angular/core';
import { getEnvVar } from 'shared';
import { Observable, of, switchMap } from 'rxjs';
import { DatasetStatus, UserDatasetInfo } from '../_models';
import { DropInModel } from './_model';
import {
  RenameCountryPipe,
  RenameLanguagePipe,
  RenameStatusPipe,
  RenameStepPipe
} from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  renameStepPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();
  renameCountryPipe = new RenameCountryPipe();
  renameLanguagePipe = new RenameLanguagePipe();

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
      const country = this.renameCountryPipe.transform(item['country']);
      const language = this.renameLanguagePipe.transform(item['language'].toLowerCase());

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
          value: item['dataset-name'],
          summaryInclude: true
        },
        date: {
          value: item['creation-date'],
          summaryInclude: true
        },
        description: {
          value: `${language}`,
          tooltip: country,
          // TODO: the country should be an ISOCode?
          dropInClass: 'flag-orb IT'
        },
        'harvest-protocol': {
          value: protocol
        },
        status: {
          summaryInclude: true,
          value: status,
          valueOverride: `(${item['processed-records']} / ${item['total-records']})`,
          tooltip: status,
          dropInClass: statusIcon,
          nowrap: true
        }
      };
    });
    return of(res);
  }
}
