import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { createPoller, DataPoller } from 'shared';
import { SandboxService } from '../_services';
import { DropInModel, TierSummaryRecord } from '../_models';

@Injectable({ providedIn: 'root' })
export class DropInRecordService {
  private readonly sandbox = inject(SandboxService);

  private activePoller?: DataPoller;
  private datasetId?: number;
  private pollerSubs: Array<{ unsubscribe: () => void }> = [];

  private readonly recordsSubject = new ReplaySubject<Array<DropInModel>>(1);
  public readonly signalObservable: Observable<
    Array<DropInModel>
  > = this.recordsSubject.asObservable();

  /**
   * cleanup
   * Called directly by (pauseModelSignal)="dropInRecords.cleanup()" in your markup
   */
  cleanup(): void {
    this.datasetId = undefined;
    if (this.pollerSubs.length > 0) {
      this.pollerSubs.forEach((sub) => sub.unsubscribe());
      this.pollerSubs = [];
    }
    this.activePoller = undefined;
  }

  /**
   * refreshRecords
   */
  refreshRecords(datasetId: number | undefined): void {
    if (!datasetId || this.datasetId === datasetId) {
      if (this.activePoller) {
        this.activePoller.next();
      }
      return;
    }

    // 2. Clear out previous poller tracking configurations securely
    if (this.pollerSubs.length > 0) {
      this.pollerSubs.forEach((sub) => sub.unsubscribe());
      this.pollerSubs = [];
    }

    this.datasetId = datasetId;

    const mockDestroyRef = {
      onDestroy: (callback: () => void): void => {
        this.pollerSubs.push({ unsubscribe: callback });
      }
    };

    this.activePoller = createPoller({
      interval: apiSettings.interval,
      destroyRef: mockDestroyRef as DestroyRef,

      fnServiceCall: () =>
        this.sandbox
          .getDatasetRecords(this.datasetId as number)
          .pipe(switchMap((infos: Array<TierSummaryRecord>) => this.mapToDropIn(infos))),

      fnDataProcess: (model: Array<DropInModel>) => {
        this.recordsSubject.next(model);
      },

      fnOnError: () => {
        this.recordsSubject.next([]);
      }
    });
  }

  /**
   * mapToDropIn
   */
  mapToDropIn(recordData: Array<TierSummaryRecord>): Observable<Array<DropInModel>> {
    const res =
      recordData?.map((item: TierSummaryRecord) => {
        return {
          id: {
            value: item['record-id']
          }
        };
      }) || [];
    return of(res);
  }
}
