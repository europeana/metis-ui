/** DataPollingComponent
/* - superclass for components using resettable polling
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { merge, switchMap, tap } from 'rxjs/operators';
import { triggerDelay } from '../_helpers';

@Component({
  selector: 'app-data-polling',
  template: ``
})
export class DataPollingComponent implements OnDestroy {
  pollingRefresh: Subject<boolean>;
  polledDatas: Array<Subscription> = [];

  /** ngOnDestroy
  /* call cleanup
  */
  ngOnDestroy(): void {
    this.cleanup();
  }

  /** cleanup
  /* unsubscribe from subs
  */
  cleanup(): void {
    this.polledDatas.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
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
    let pushPollCount = 0;
    const pollRefresh = new Subject<boolean>();
    pollRefresh.subscribe(() => {
      pushPollCount += 1;
    });
    const loadTrigger = new BehaviorSubject(true);
    const polledData = loadTrigger
      .pipe(
        merge(pollRefresh), // user events comes into the stream here
        switchMap(() => {
          return fnServiceCall();
        }),
        tap(() => {
          triggerDelay.next({
            subject: loadTrigger,
            wait: interval,
            blockIf: () => pushPollCount > 0,
            blockThen: () => {
              pushPollCount--;
            }
          });
        })
      )
      .subscribe(fnDataProcess, fnOnError);
    this.polledDatas.push(polledData);
    return pollRefresh;
  }
}
