/** DataPollingComponent
/* - superclass for components using resettable polling
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { merge, switchMap, tap } from 'rxjs/operators';
import { triggerDelay, TriggerDelayConfig } from '../_helpers';

@Component({
  selector: 'app-data-polling',
  template: ``
})
export class DataPollingComponent implements OnDestroy {
  loadTriggers: Array<BehaviorSubject<boolean>> = [];
  polledDatas: Array<Subscription> = [];
  polledRefreshers: Array<Subject<boolean>> = [];
  pollIntervals: Array<number> = [];

  slowPollInterval = 1000 * 60;
  pollRateDropped = false;
  visibilityContext = 0;

  /** ngOnDestroy
  /* call cleanup
  */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** visibilitychange
  /* drop / restore poll rate as per document visibility
  */
  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    if (document.hidden) {
      this.dropPollRate();
    } else {
      this.restorePollRate();
    }
  }

  /** cleanup
  /* unsubscribe from subs
  */
  cleanup(): void {
    this.polledDatas.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }

  /** dropPollRate
   * - flags that the poll rate is dropped
   * - bumps visibilityContext to ignore all pending events
   * - queues delayed events on each loadTrigger subject
   */
  dropPollRate(): void {
    this.visibilityContext += 1;
    this.pollRateDropped = true;
    this.loadTriggers.forEach((trigger: BehaviorSubject<boolean>, index: number) => {
      let conf = this.getTriggerDelayConfig(
        trigger,
        this.visibilityContext,
        this.pollIntervals[index]
      );
      triggerDelay.next(conf);
    });
  }

  /**
   * restorePollRate
   * - flags that the poll rate is no longer dropped
   * - bumps visibilityContext to ignore all pending events
   * - fire new events on each pollRefresher subject
   */
  restorePollRate(): void {
    this.pollRateDropped = false;
    this.visibilityContext += 1;
    this.polledRefreshers.forEach((subject: Subject<boolean>) => {
      subject.next(true);
    });
  }

  getTriggerDelayConfig(
    loadTrigger: Subject<boolean>,
    visibilityContextBind: number,
    interval: number
  ): TriggerDelayConfig {
    const delay = this.pollRateDropped ? this.slowPollInterval : interval;
    return {
      subject: loadTrigger,
      wait: delay,
      blockIf: () => {
        if (visibilityContextBind !== this.visibilityContext) {
          return true;
        }
        return false;
      }
    };
  }

  /** createNewDataPoller
   *  - sets up a timed polling mechanism
   *  - ticks initiate when last data call returns
   *  - returns a subject to sync polling with user interactions
   */
  createNewDataPoller<T>(
    interval: number,
    fnServiceCall: () => Observable<T>,
    fnDataProcess: (result: T) => void,
    fnOnError?: (err: HttpErrorResponse) => HttpErrorResponse | false
  ): Subject<boolean> {
    const pollRefresh = new Subject<boolean>();

    pollRefresh.subscribe(() => {
      this.visibilityContext += 1;
    });

    const loadTrigger = new BehaviorSubject(true);

    const polledData = loadTrigger
      .pipe(
        merge(pollRefresh), // user events comes into the stream here
        switchMap(() => {
          return fnServiceCall();
        }),
        tap(() => {
          let conf = this.getTriggerDelayConfig(loadTrigger, this.visibilityContext, interval);
          triggerDelay.next(conf);
        })
      )
      .subscribe(fnDataProcess, fnOnError);

    this.loadTriggers.push(loadTrigger);
    this.polledDatas.push(polledData);
    this.polledRefreshers.push(pollRefresh);
    this.pollIntervals.push(interval);
    return pollRefresh;
  }
}
