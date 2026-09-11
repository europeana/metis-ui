import { inject, DestroyRef } from '@angular/core';
import { Observable, fromEvent, merge, of, Subject, defer, timer } from 'rxjs'; // Added timer
import { distinctUntilChanged, repeat, switchMap, catchError, filter } from 'rxjs/operators';

export interface PollingOptions<T> {
  interval: number;
  maxInterval?: number;
  fnServiceCall: () => Observable<T>;
  fnDataProcess: (result: T) => void;
  fnDistinctValues?: (prev: T, curr: T) => boolean;
  fnOnError?: (err: any) => void;
}

export function createPoller<T>(options: PollingOptions<T>) {
  const destroyRef = inject(DestroyRef, { optional: true });
  const manualRefresh$ = new Subject<void>();
  const maxInterval = options.maxInterval ?? 570000;

  const visibilityWakeup$ = fromEvent(document, 'visibilitychange').pipe(
    filter(() => !document.hidden)
  );

  const trigger$ = merge(of(void 0), manualRefresh$, visibilityWakeup$);

  const pollStream$ = trigger$.pipe(
    switchMap(() => {
      return defer(() => options.fnServiceCall()).pipe(
        switchMap((data) => {
          options.fnDataProcess(data);
          return of(data);
        }),
        options.fnDistinctValues
          ? distinctUntilChanged(options.fnDistinctValues)
          : (source) => source,
        catchError((err) => {
          if (options.fnOnError) {
            options.fnOnError(err);
          }
          return of(null);
        }),
        repeat({
          delay: () => timer(document.hidden ? maxInterval : options.interval)
        })
      );
    })
  );

  const subscription = pollStream$.subscribe();

  destroyRef?.onDestroy(() => {
    subscription.unsubscribe();
  });

  return {
    next: () => manualRefresh$.next(),
    cleanup: () => subscription.unsubscribe()
  };
}
