import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, ModelSignal } from '@angular/core';
import { Observable, of, Subscription, switchMap, takeWhile, tap, timer } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { isoCountryCodes } from '../_data';
import { DatasetStatus, DropInModel, UserDatasetInfo } from '../_models';
import { RenameStatusPipe, RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  private readonly http = inject(HttpClient);

  renameStepPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();
  datePipe = new DatePipe('en-US');

  pollInterval = 2 * apiSettings.interval;
  sub: Subscription;

  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/user-datasets`);
  }

  /** getDropInModel2
   **/
  getDropInModel2(signal: ModelSignal<Array<DropInModel>>): void {
    let complete = false;

    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.sub = timer(0, this.pollInterval)
      .pipe(
        switchMap(() => {
          return this.getUserDatsets();
        }),
        tap((infos: Array<UserDatasetInfo>) => {
          console.log('assess ' + infos.length + ' infos');

          const incomplete = infos.find((info: UserDatasetInfo) => {
            return info.status === DatasetStatus.IN_PROGRESS;
          });
          if (!incomplete) {
            console.log('set complete flag here!');
            complete = true;
          }
        }),
        switchMap((infos: Array<UserDatasetInfo>) => {
          return this.mapToDropIn(infos);
        }),
        takeWhile((model: Array<DropInModel>) => {
          signal.set(model);
          return !complete;
        })
      )
      .subscribe();
  }

  mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Observable<Array<DropInModel>> {
    const res = userDatasetInfo.map((item: UserDatasetInfo) => {
      const protocol = this.renameStepPipe.transform(item['harvest-protocol'], [true]);
      const status = this.renameStatusPipe.transform(item['status']);
      const statusIcon = (): string => {
        if (item['status'] === DatasetStatus.IN_PROGRESS) {
          return 'drop-in-spinner';
        } else if (item['status'] === DatasetStatus.COMPLETED) {
          return 'drop-in-tick';
        }
        return 'drop-in-cross';
      };

      return {
        id: {
          value: item['dataset-id']
        },
        status: {
          customClass: statusIcon(),
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
          customClass: `flag-orb ${isoCountryCodes[item['country']]}`,
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
