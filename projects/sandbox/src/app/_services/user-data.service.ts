import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';

import { KeycloakAuthService } from './keycloak-auth.service';
import { RenameStepPipe } from '../_translate';
import { DropInModel, UserDatasetInfo } from '../_models';
import { createPoller } from 'shared';

const DATE_CONCISE_FMT = 'yyyy-MM-dd';
const isoCountryCodes: Record<string, string> = {
  NL: 'nl',
  FR: 'fr',
  DE: 'de'
};

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(KeycloakAuthService);

  private readonly renameStepPipe = new RenameStepPipe();
  private readonly datePipe = new DatePipe('en-US');

  public readonly pollInterval = 2 * apiSettings.interval;

  private pollerSubs: Array<{ unsubscribe: () => void }> = [];

  public readonly signalUserDatasetModel = signal<Array<DropInModel>>([]);

  private readonly datasetModelSubject = new BehaviorSubject<Array<DropInModel>>([]);
  public readonly signalObservable: Observable<
    Array<DropInModel>
  > = this.datasetModelSubject.asObservable();

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refreshUserDatsetPoller();
      }
    });
  }

  /**
   * cleanup
   * Restores compatibility with (pauseModelSignal)="userDataService.cleanup()" or manual breaks
   */
  public cleanup(): void {
    if (this.pollerSubs.length > 0) {
      this.pollerSubs.forEach((sub) => sub.unsubscribe());
      this.pollerSubs = [];
    }
  }

  /**
   * refreshUserDatsetPoller
   * Initiates stable polled configuration stream intervals mapping datasets
   */
  public refreshUserDatsetPoller(): void {
    if (this.pollerSubs.length > 0) {
      this.pollerSubs.forEach((sub) => sub.unsubscribe());
      this.pollerSubs = [];
    }

    const mockDestroyRef = {
      onDestroy: (callback: () => void): void => {
        this.pollerSubs.push({ unsubscribe: callback });
      }
    };

    createPoller({
      interval: this.pollInterval,
      destroyRef: (mockDestroyRef as unknown) as DestroyRef,

      fnServiceCall: () =>
        this.getUserDatsets().pipe(
          catchError((error) => {
            console.log('Dataset polling failed:', error);
            return of([]);
          }),
          map((infos: Array<UserDatasetInfo>) => {
            if (!infos || infos.length === 0) return [];

            return [...infos].sort((a: UserDatasetInfo, b: UserDatasetInfo) => {
              if (a['creation-date'] > b['creation-date']) return -1;
              if (b['creation-date'] > a['creation-date']) return 1;
              return 0;
            });
          }),
          map((sortedInfos: Array<UserDatasetInfo>) => this.mapToDropIn(sortedInfos))
        ),

      fnDataProcess: (model: Array<DropInModel>) => {
        this.signalUserDatasetModel.set(model);
        this.datasetModelSubject.next(model);
      },

      fnOnError: () => {
        this.datasetModelSubject.next([]);
      }
    });
  }

  /**
   * prependUserDatset
   * Pushes a 'pending' entry to the front of the dataset collection lists
   * @param { string } id - the id of the pending entry
   */
  public prependUserDatset(id: string): void {
    const pendingEntry: DropInModel = {
      id: { value: id },
      name: { value: 'pending' },
      about: { value: '-' },
      'harvest-protocol': { value: '-' },
      date: { value: '-' }
    };

    this.signalUserDatasetModel.update((arr) => [pendingEntry, ...arr]);

    const currentList = this.datasetModelSubject.getValue();
    this.datasetModelSubject.next([pendingEntry, ...currentList]);
  }

  /**
   * getUserDatsets
   * Returns empty array if unauthenticated or requests the authenticated user's datasets
   * @return Observable<Array<UserDatasetInfo>>
   */
  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    if (this.auth.isAuthenticated()) {
      return of(null).pipe(
        switchMap(() =>
          this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/users/me/datasets`)
        )
      );
    }
    return of([]);
  }

  /**
   * getUserDatasetsPolledObservable
   * Main entry method bound by the parent template host inputs
   */
  public getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return this.signalObservable;
  }

  /**
   * mapToDropIn
   * Maps backend UserDatasetInfo structures into UI-ready DropInModel specifications
   * @param {Array<UserDatasetInfo>} userDatasetInfo - original network details array
   * @return Array<DropInModel>
   */
  public mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Array<DropInModel> {
    if (!userDatasetInfo) return [];

    return userDatasetInfo.map((item: UserDatasetInfo) => {
      const protocol = this.renameStepPipe.transform(item['harvest-protocol'], [true]);

      return {
        id: { value: item['dataset-id'] },
        name: { value: item['dataset-name'] },
        'harvest-protocol': { value: protocol },
        about: {
          customClass: `flag-orb ${isoCountryCodes[item['country']] || ''}`,
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
  }
}
