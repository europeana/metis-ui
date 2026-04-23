import { toObservable } from '@angular/core/rxjs-interop';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { SubscriptionManager } from 'shared';
import { SandboxService } from '../_services';
import { DropInModel, TierSummaryRecord } from '../_models';

@Injectable({ providedIn: 'root' })
export class DropInRecordService extends SubscriptionManager {
  sandbox = inject(SandboxService);

  lastLoaded: undefined | number = -1;
  datasetId?: number;

  signalDatasetRecords = signal([] as Array<DropInModel>);
  signalObservable: Observable<Array<DropInModel>>;

  constructor() {
    super();
    this.signalObservable = toObservable(this.signalDatasetRecords);
  }

  /**
   * refreshDatasetRecords
   *
   * subscribes to record data and sets signal
   */
  refreshRecords(datasetId: number | undefined): void {
    this.datasetId = datasetId;
    if (!this.datasetId) {
      return;
    }

    if (this.lastLoaded === datasetId && this.signalDatasetRecords().length > 0) {
      return;
    }

    if (this.subs.length) {
      this.cleanup();
    }

    this.subs.push(
      this.sandbox
        .getDatasetRecords(this.datasetId as number)
        .pipe(
          switchMap((infos: Array<TierSummaryRecord>) => {
            return this.mapToDropIn(infos);
          }),
          tap((model: Array<DropInModel>) => {
            this.lastLoaded = this.datasetId;
            this.signalDatasetRecords.set(model);
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
