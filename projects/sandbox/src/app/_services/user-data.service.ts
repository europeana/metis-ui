import { effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, takeWhile } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';

import { SubscriptionManager } from 'shared'; // Assumed base class path
import { KeycloakAuthService } from './keycloak-auth.service'; // Assumed auth service path
import { RenameStepPipe } from '../_translate'; // Assumed pipe path
import { DropInModel, UserDatasetInfo } from '../_models'; // Assumed model paths

const DATE_CONCISE_FMT = 'yyyy-MM-dd';
const isoCountryCodes: Record<string, string> = {
  NL: 'nl',
  FR: 'fr',
  DE: 'de' // Extensible country mapping dict
};

@Injectable({
  providedIn: 'root'
})
export class UserDataService extends SubscriptionManager {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(KeycloakAuthService);

  private readonly renameStepPipe = new RenameStepPipe();
  private readonly datePipe = new DatePipe('en-US');

  public readonly pollInterval = 2 * apiSettings.interval;

  // 1. Maintain internal signal state if needed for template metrics
  public readonly signalUserDatasetModel = signal<Array<DropInModel>>([]);

  // 2. ✅ FIXED FOR ZONELESS: Standardize on BehaviorSubject to guarantee immediate,
  // synchronous emissions the millisecond components subscribe on startup.
  private readonly datasetModelSubject = new BehaviorSubject<Array<DropInModel>>([]);
  public readonly signalObservable: Observable<
    Array<DropInModel>
  > = this.datasetModelSubject.asObservable();

  constructor() {
    super();

    // Native Angular signal effect automatically manages tracking boundaries
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.refreshUserDatsetPoller();
      }
    });
  }

  /**
   * prependUserDatset
   *
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

    // Update both local signal references and our stream buffer subjects simultaneously
    this.signalUserDatasetModel.update((arr) => [pendingEntry, ...arr]);

    const currentList = this.datasetModelSubject.getValue();
    this.datasetModelSubject.next([pendingEntry, ...currentList]);
  }

  /**
   * getUserDatsets
   *
   * Returns empty array if unauthenticated or requests the authenticated user's datasets
   * @return Observable<Array<UserDatasetInfo>>
   */
  /**
   * getUserDatsets
   *
   * Returns empty if unauthenticated or the user's datasets
   * @return Observable<Array<UserDatasetInfo>>
   */
  getUserDatsets(): Observable<Array<UserDatasetInfo>> {
    // ✅ FIX FOR ZONELESS AUTH TIMING:
    // Ensures Keycloak context checking is evaluated sequentially
    // before the HttpClient schedules its background network request.
    if (this.auth.isAuthenticated()) {
      return of(null).pipe(
        switchMap(() => {
          return this.http.get<Array<UserDatasetInfo>>(`${apiSettings.apiHost}/users/me/datasets`);
        })
      );
    }
    return of([]);
  }

  /**
   * getUserDatasetsPolledObservable
   *
   * Main entry method bound by the parent template host inputs
   */
  public getUserDatasetsPolledObservable(): Observable<Array<DropInModel>> {
    return this.signalObservable;
  }

  /**
   * refreshUserDatsetPoller
   *
   * Initiates stable polled configuration stream intervals mapping datasets
   */
  public refreshUserDatsetPoller(): void {
    const complete = false;

    if (this.subs.length) {
      this.cleanup();
    }

    this.subs.push(
      timer(0, this.pollInterval)
        .pipe(
          switchMap(() =>
            this.getUserDatsets().pipe(
              catchError((error) => {
                console.log('Dataset polling failed:', error);
                return of([]);
              })
            )
          ),
          distinctUntilChanged((previous, current) => {
            return JSON.stringify(previous) === JSON.stringify(current);
          }),
          switchMap((infos: Array<UserDatasetInfo>) => {
            // Sort by descending creation timestamp
            infos.sort((a: UserDatasetInfo, b: UserDatasetInfo) => {
              if (a['creation-date'] > b['creation-date']) return -1;
              if (b['creation-date'] > a['creation-date']) return 1;
              return 0;
            });
            return this.mapToDropIn(infos);
          }),
          takeWhile((model: Array<DropInModel>) => {
            // ✅ Updates downstream subscribers without inducing change context lag loops
            this.signalUserDatasetModel.set(model);
            this.datasetModelSubject.next(model);
            return !complete;
          })
        )
        .subscribe()
    );
  }

  /**
   * mapToDropIn
   *
   * Maps backend UserDatasetInfo structures into UI-ready DropInModel specifications
   *
   * @param {Array<UserDatasetInfo>} userDatasetInfo - original network details array
   * @return Observable<Array<DropInModel>>
   */
  public mapToDropIn(userDatasetInfo: Array<UserDatasetInfo>): Observable<Array<DropInModel>> {
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
    return of(res);
  }
}
