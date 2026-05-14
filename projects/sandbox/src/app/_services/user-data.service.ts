import { toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';

import { Observable, of, switchMap, takeWhile, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { SubscriptionManager } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { DATE_CONCISE_FMT, isoCountryCodes } from '../_data';
import { DropInModel, UserDatasetInfo } from '../_models';
import { RenameStepPipe } from '../_translate';
import { KeycloakAuthService } from './keycloak-auth.service';

@Injectable({ providedIn: 'root' })
export class UserDataService extends SubscriptionManager {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(KeycloakAuthService);

  private readonly renameStepPipe = new RenameStepPipe();
  private readonly datePipe = new DatePipe('en-US');

  pollInterval = 2 * apiSettings.interval;

  signalUserDatasetModel = signal<Array<DropInModel>>([]);
  signalObservable: Observable<Array<DropInModel>>;

  constructor() {
    super();
    this.signalObservable = toObservable(this.signalUserDatasetModel);

    effect(() => {
      // ✅ Evaluates using the correct computed signal property name from your auth service
      if (this.auth.isAuthenticated()) {
        this.refreshUserDatsetPoller();
      }
    });
  }

  /**
   * prependUserDatset
   *
   * Pushes a 'pending' entry to signalUserDatasetModel
   * @param { string } id - the id of the pending entry
   */
  prependUserDatset(id: string): void {
    const pendingEntry: DropInModel = {
      id: {
        value: id
      },
      name: {
        value: 'pending'
      },
      about: {
        value: '-'
      },
      'harvest-protocol': {
        value: '-'
      },
      date: {
        value: '-'
      }
    };
    this.signalUserDatasetModel.update((arr: Array<DropInModel>) => {
      return [pendingEntry, ...arr];
    });
  }

  /**
   * getUserDatsets
   *
   * Returns empty if unauthenticated or the user's datasets
   * @return Observable<Array<UserDatasetInfo>>
   */
  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    // ✅ Evaluates using the correct computed signal property name from your auth service
    if (this.auth.isAuthenticated()) {
      return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/users/me/datasets`);
    }
    return of([]);
  }

  getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return this.signalObservable;
  }

  /**
   * refreshUserDatsetPoller
   *
   * initiate polled updates to signalUserDatasetModel
   */
  refreshUserDatsetPoller(): void {
    const complete = false;

    if (this.subs.length) {
      this.cleanup();
    }
    this.subs.push(
      timer(0, this.pollInterval)
        .pipe(
          switchMap(() => {
            return this.getUserDatsets();
          }),
          distinctUntilChanged((previous, current) => {
            return JSON.stringify(previous) === JSON.stringify(current);
          }),
          switchMap((infos: Array<UserDatasetInfo>) => {
            infos.sort((a: UserDatasetInfo, b: UserDatasetInfo) => {
              if (a['creation-date'] > b['creation-date']) {
                return -1;
              } else if (b['creation-date'] > a['creation-date']) {
                return 1;
              } else {
                return 0;
              }
            });
            return this.mapToDropIn(infos);
          }),
          takeWhile((model: Array<DropInModel>) => {
            this.signalUserDatasetModel.set(model);
            return !complete;
          })
        )
        .subscribe()
    );
  }

  /**
   * mapToDropIn
   *
   * Maps a UserDatasetInfo array to an array of DropInModel data
   *
   * @param {} userDatasetInfo - the data to convert
   * @return Observable<Array<DropInModel>>
   */
  mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Observable<Array<DropInModel>> {
    const res = userDatasetInfo.map((item: UserDatasetInfo) => {
      const protocol = this.renameStepPipe.transform(item['harvest-protocol'], [true]);

      return {
        id: {
          value: item['dataset-id']
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
          tooltip: `${this.datePipe.transform(item['creation-date'], 'HH:mm:ss') || ''}`,
          value: item['creation-date'],
          valueOverride: `${this.datePipe.transform(item['creation-date'], DATE_CONCISE_FMT) || ''}`
        }
      };
    });
    return of(res);
  }
}
