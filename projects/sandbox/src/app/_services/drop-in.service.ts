import { toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Observable, of, Subscription, switchMap, takeWhile, tap, timer } from 'rxjs';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { apiSettings } from '../../environments/apisettings';
import { isoCountryCodes } from '../_data';
import { DatasetStatus, DropInModel, UserDatasetInfo } from '../_models';
import { RenameStatusPipe, RenameStepPipe } from '../_translate';

@Injectable({ providedIn: 'root' })
export class DropInService {
  private readonly http = inject(HttpClient);
  readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  renameStepPipe = new RenameStepPipe();
  renameStatusPipe = new RenameStatusPipe();

  datePipe = new DatePipe('en-US');
  pollInterval = 2 * apiSettings.interval;

  sub: Subscription;

  signal = signal([] as Array<DropInModel>);
  signalObservable: Observable<Array<DropInModel>>;

  constructor() {
    this.signalObservable = toObservable(this.signal);

    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.refreshUserDatsetPoller();
      }
    });
  }

  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    if (this.keycloak.authenticated) {
      return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/user-datasets`);
    }
    return of([]);
  }

  getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return this.signalObservable;
  }

  refreshUserDatsetPoller(): void {
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
          const incomplete = infos.find((info: UserDatasetInfo) => {
            return info.status === DatasetStatus.IN_PROGRESS;
          });
          if (!incomplete) {
            complete = true;
          }
        }),
        switchMap((infos: Array<UserDatasetInfo>) => {
          return this.mapToDropIn(infos);
        }),
        takeWhile((model: Array<DropInModel>) => {
          this.signal.set(model);
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
        if (item['status'] === DatasetStatus.FAILED) {
          return 'drop-in-cross';
        } else if (item['status'] === DatasetStatus.COMPLETED) {
          return 'drop-in-tick';
        }
        return 'drop-in-spinner';
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
