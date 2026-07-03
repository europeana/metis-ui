import { inject, Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubscriptionManager } from 'shared';
import { SandboxService } from '../_services';
import { DropInModel, TierSummaryRecord } from '../_models';

@Injectable({ providedIn: 'root' })
export class DropInRecordService extends SubscriptionManager {
  private readonly sandbox = inject(SandboxService);

  private lastLoaded: undefined | number = -1;
  private datasetId?: number;

  // create a ReplaySubject and expose it directly to the HTML template binding
  private readonly recordsSubject = new ReplaySubject<Array<DropInModel>>(1);
  public readonly signalObservable: Observable<
    Array<DropInModel>
  > = this.recordsSubject.asObservable();

  /**
   * refreshRecords
   */
  refreshRecords(datasetId: number | undefined): void {
    this.datasetId = datasetId;
    if (!this.datasetId) {
      return;
    }

    if (this.lastLoaded === datasetId) {
      return;
    }

    if (this.subs.length) {
      this.cleanup();
    }

    this.subs.push(
      this.sandbox
        .getDatasetRecords(this.datasetId)
        .pipe(
          switchMap((infos: Array<TierSummaryRecord>) => {
            return this.mapToDropIn(infos);
          }),
          catchError((error) => {
            console.log('Record fetch failed:', error);
            return of([]);
          }),
          tap((model: Array<DropInModel>) => {
            this.lastLoaded = this.datasetId;
            this.recordsSubject.next(model);
          })
        )
        .subscribe()
    );
  }

  /**
   * mapToDropIn
   *
   * Maps a TierSummaryRecord array to an array of DropInModel data
   *
   * @param {} recordData - the data to convert
   * @return Observable<Array<DropInModel>>
   */
  mapToDropIn(recordData: Array<TierSummaryRecord>): Observable<Array<DropInModel>> {
    const res = recordData.map((item: TierSummaryRecord) => {
      return {
        id: {
          value: item['record-id']
        }
      };
    });
    return of(res);
  }
}
