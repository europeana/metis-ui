import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

import { apiSettings } from '../../environments/apisettings';
import { KeycloakAuthService } from './keycloak-auth.service';
import { RenameStepPipe } from '../_translate';
import { DropInModel, UserDatasetInfo } from '../_models';
import { createPoller } from 'shared';

const DATE_CONCISE_FMT = 'yyyy-MM-dd';
const ISO_COUNTRY_CODES: Record<string, string> = {
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
  private readonly destroyRef = inject(DestroyRef);

  private readonly renameStepPipe = new RenameStepPipe();
  private readonly datePipe = new DatePipe('en-US');

  public readonly pollInterval = 2 * apiSettings.interval;
  private pollerCleanupFn?: () => void;

  private pollerSubs: Array<{ unsubscribe: () => void }> = [];

  public readonly signalUserDatasetModel = signal<Array<DropInModel>>([]);
  public readonly loading = signal<boolean>(true);
  public readonly signalObservable: Observable<Array<DropInModel>> = toObservable(
    this.signalUserDatasetModel
  );

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refreshUserDatasetPoller();
      } else {
        this.cleanup();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  /**
   * cleanup
   * Restores compatibility with (pauseModelSignal)="userDataService.cleanup()" or manual breaks
   */
  public cleanup(): void {
    if (this.pollerCleanupFn) {
      this.pollerCleanupFn();
      this.pollerCleanupFn = undefined;
    }

    if (this.pollerSubs && this.pollerSubs.length > 0) {
      this.pollerSubs.forEach((sub) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      this.pollerSubs = [];
    }
  }

  /**
   * refreshUserDatasetPoller
   * Initiates stable polled configuration stream intervals mapping datasets
   */
  public refreshUserDatasetPoller(): void {
    this.cleanup();
    const dynamicDestroyRef = {
      onDestroy: (callback: () => void): void => {
        this.pollerCleanupFn = callback;
        this.pollerSubs = [{ unsubscribe: callback }];
      }
    } as DestroyRef;

    createPoller({
      interval: this.pollInterval,
      destroyRef: dynamicDestroyRef,
      fnServiceCall: () => {
        this.loading.set(true);
        return this.getUserDatasets().pipe(
          catchError((error) => {
            console.error('Dataset polling failed:', error);
            return of([]);
          }),
          map((infos = []) =>
            [...infos].sort((a, b) => b['creation-date'].localeCompare(a['creation-date']))
          ),
          map((sortedInfos) => this.mapToDropIn(sortedInfos)),
          finalize(() => this.loading.set(false))
        );
      },
      fnDataProcess: (model) => this.signalUserDatasetModel.set(model),
      fnOnError: () => this.signalUserDatasetModel.set([])
    });
  }

  public getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return this.signalObservable;
  }

  /**
   * prependUserDatset
   * Pushes a 'pending' entry to the front of the dataset collection lists
   * @param { string } id - the id of the pending entry
   */
  public prependUserDataset(id: string): void {
    const pendingEntry: DropInModel = {
      id: { value: id },
      name: { value: 'pending' },
      about: { value: '-' },
      'harvest-protocol': { value: '-' },
      date: { value: '-' }
    };
    this.signalUserDatasetModel.update((arr) => [pendingEntry, ...arr]);
  }

  /**
   * getUserDatasets
   * Returns empty array if unauthenticated or requests the authenticated user's datasets
   * @return Observable<Array<UserDatasetInfo>>
   */
  public getUserDatasets(): Observable<Array<UserDatasetInfo>> {
    if (!this.auth.isAuthenticated()) return of([]);
    return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/users/me/datasets`);
  }

  /**
   * mapToDropIn
   * Maps backend UserDatasetInfo structures into UI-ready DropInModel specifications
   * @param {Array<UserDatasetInfo>} userDatasetInfo - original network details array
   * @return Array<DropInModel>
   */
  public mapToDropIn(userDatasetInfo: Array<UserDatasetInfo> = []): Array<DropInModel> {
    return userDatasetInfo.map((item) => {
      const protocol = this.renameStepPipe.transform(item['harvest-protocol'], [true]);
      const dateVal = item['creation-date'];

      return {
        id: { value: item['dataset-id'] },
        name: { value: item['dataset-name'] },
        'harvest-protocol': { value: protocol },
        about: {
          customClass: `flag-orb ${ISO_COUNTRY_CODES[item['country']] || ''}`,
          tooltip: item['country'],
          value: item['language']
        },
        date: {
          tooltip: this.datePipe.transform(dateVal, 'HH:mm:ss') ?? '',
          value: dateVal,
          valueOverride: this.datePipe.transform(dateVal, DATE_CONCISE_FMT) ?? ''
        }
      };
    });
  }
}
