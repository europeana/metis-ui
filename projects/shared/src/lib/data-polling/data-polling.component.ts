/** DataPollingComponent
 * - defines superclass behaviours for components using resettable polling
 * - manages multiple polling configurations per instance
 * - binds the polling rate to the document visibility
 * - uses chained call-backs so network lags don't shorten the polling interval
 * - allows manual polling refresh
 * - queued event-chains superceded by newer ones (via user interaction) are discarded if the pollContext they were bound to was updated
 **/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { BehaviorSubject, identity, merge, Observable, Subject, Subscription, timer } from 'rxjs';
import { delayWhen, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { SubscriptionManager } from '../subscription-manager/subscription.manager';

export interface DataPollerInfo {
  identifier?: string;
  interval: number;
  refresher: Subject<boolean>;
  trigger: Subject<boolean>;
  pollContext: number;
  subscription?: Subscription;
}

export interface TriggerDelayConfig {
  subject: Subject<boolean>;
  wait: number;
  blockIf: () => boolean;
}

export interface PollingSubjectAccessor {
  getPollingSubject: () => Subject<boolean>;
}

@Component({
  selector: 'app-data-polling',
  template: ``,
  standalone: true
})
export class DataPollingComponent extends SubscriptionManager implements OnDestroy {
  allPollingInfo: Array<DataPollerInfo> = [];
  allRefreshSubs: Array<Subscription> = [];
  pollRateDropped = false;
  intervalStatusMax = 60000 * 9.5;
  triggerDelay = new Subject<TriggerDelayConfig>();

  /** constructor
  /* attach generic functionality to triggerDelay subject
  */
  constructor() {
    super();
    this.subs.push(
      this.triggerDelay
        .pipe(
          delayWhen((val) => {
            return timer(val.wait);
          }),
          filter((val) => {
            return !val.blockIf();
          }),
          tap((val) => val.subject.next(true))
        )
        .subscribe()
    );
  }

  /** ngOnDestroy
  /* call cleanup
  */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** visibilitychange
  /* call handleVisibilityChange on document visibility changes
  */
  @HostListener('document:visibilitychange')
  visibilitychange(): void {
    this.handleVisibilityChange(document.hidden);
  }

  /** handleVisibilityChange
  /* drop / restore poll rate as per isHidden
  /*  @param {boolean} isHidden - document visibility
  */
  handleVisibilityChange(isHidden: boolean): void {
    if (isHidden) {
      this.dropPollRate();
    } else {
      this.restorePollRate();
    }
  }

  /**
   * cleanup
   * - calls clearDataPollers
   * - unsubs from allRefreshSubs
   * - calls super.cleanup()
   **/
  cleanup(): void {
    this.clearDataPollers();
    this.allRefreshSubs.forEach((sub?: Subscription) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    super.cleanup();
  }

  /**
   * clearDataPollers
   * - unsub from pollerData
   **/
  clearDataPollers(): void {
    this.allPollingInfo.forEach((pollerData: DataPollerInfo) => {
      if (pollerData && pollerData.subscription) {
        pollerData.subscription.unsubscribe();
      }
    });
  }

  /**
   * clearDataPollerByIdentifier
   * - unsub from specific pollerData
   *  @param { Subject<string> } identifier
   **/
  clearDataPollerByIdentifier(identifier: string): void {
    const item = this.allPollingInfo.find((pollerData: DataPollerInfo) => {
      return (
        !(pollerData.subscription && pollerData.subscription.closed) &&
        !!pollerData.identifier &&
        pollerData.identifier === identifier
      );
    });
    if (item && item.subscription) {
      item.subscription.unsubscribe();
    }
  }

  /** dropPollRate
   * - flags that the poll rate is dropped
   * - bumps visibilityContext to ignore all pending events
   * - queues delayed events on each loadTrigger subject
   */
  dropPollRate(): void {
    this.bumpPollContexts();
    this.pollRateDropped = true;
    this.allPollingInfo.forEach((info: DataPollerInfo, index: number) => {
      const conf = this.getTriggerDelayConfig(info.trigger, info.pollContext, index, info.interval);
      this.triggerDelay.next(conf);
    });
  }

  /** bumpPollContexts
   * - increments all pollContexts by 1
   */
  bumpPollContexts(): void {
    this.allPollingInfo.forEach((pollerData: DataPollerInfo) => {
      pollerData.pollContext = pollerData.pollContext + 1;
    });
  }

  /**
   * restorePollRate
   * - flags that the poll rate is no longer dropped
   * - bumps pollContexts to ignore all pending events
   * - fire new events on each pollRefresher subject
   */
  restorePollRate(): void {
    this.pollRateDropped = false;
    this.bumpPollContexts();
    this.allPollingInfo.forEach((info: DataPollerInfo) => {
      info.refresher.next(true);
    });
  }

  /** getTriggerDelayConfig
   *  @param {Subject<boolean>} loadTrigger - the Subject to trigger event on
   *  @param {number} visibilityContextBind - the context at time of invocation / queuing
   *  @param {number} infoIndex - the index for the context at time of execution
   *  @param {number} interval - the default delay time for this data source
   *  binds variables to delayed trigger configuration
   *  return TriggerDelayConfig with the correct delay
   */
  getTriggerDelayConfig(
    loadTrigger: Subject<boolean>,
    visibilityContextBind: number,
    infoIndex: number,
    interval: number
  ): TriggerDelayConfig {
    return {
      subject: loadTrigger,
      wait: this.pollRateDropped ? this.intervalStatusMax : interval,
      blockIf: (): boolean => visibilityContextBind !== this.allPollingInfo[infoIndex].pollContext
    };
  }

  /** createNewDataPoller
   *  @param {number} interval - polling interval
   *  @param {() => Observable<T>} fnServiceCall - the data fetch function
   *  @param {false | (prev: T, curr: T) => boolean} fnDistinctValues - optional function for distinct value detection
   *  @param {(result: T) => void} fnDataProcess - the data processing function
   *  @param {(err: HttpErrorResponse) => HttpErrorResponse | false} fnOnError - function to invoke on error
   *  - sets up polled data stream
   *  - ticks initiate when last data call returns
   *  return a subject to sync polling with user interactions
   */
  createNewDataPoller<T>(
    interval: number,
    fnServiceCall: () => Observable<T>,
    fnDistinctValues: false | ((prev: T, curr: T) => boolean),
    fnDataProcess: (result: T) => void,
    fnOnError?: (err: HttpErrorResponse) => HttpErrorResponse | false,
    identifier?: string
  ): PollingSubjectAccessor {
    const pollRefresh = new Subject<boolean>();
    const loadTrigger = new BehaviorSubject(true);
    const pollContextIndex = this.allPollingInfo.length;

    this.allRefreshSubs.push(
      pollRefresh.subscribe({
        next: () => {
          this.allPollingInfo[pollContextIndex].pollContext++;
        }
      })
    );

    this.allPollingInfo.push({
      interval: interval,
      identifier: identifier,
      refresher: pollRefresh,
      trigger: loadTrigger,
      pollContext: 0
    });

    this.allPollingInfo[pollContextIndex].subscription = merge(loadTrigger, pollRefresh)
      .pipe(
        switchMap(() => {
          return fnServiceCall();
        }),
        tap(() => {
          const conf = this.getTriggerDelayConfig(
            loadTrigger,
            this.allPollingInfo[pollContextIndex].pollContext,
            pollContextIndex,
            interval
          );
          this.triggerDelay.next(conf); // queue next call in chain
        })
      )
      .pipe(fnDistinctValues ? distinctUntilChanged(fnDistinctValues) : identity)
      .subscribe({
        next: fnDataProcess,
        error: fnOnError
      });
    return {
      getPollingSubject: (): Subject<boolean> => {
        return pollRefresh;
      }
    };
  }
}
