import { DestroyRef } from '@angular/core';
import { defer, fromEvent, merge, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  repeat,
  switchMap,
  takeUntil
} from 'rxjs/operators';

export interface DataPoller {
  next(): void;
  unsubscribe(): void;
}

export interface PollingOptions<T> {
  interval: number;
  maxInterval?: number;
  destroyRef: DestroyRef;
  fnServiceCall: () => Observable<T>;
  fnDataProcess: (result: T) => void;
  fnDistinctValues?: (prev: T, curr: T) => boolean;
  fnOnError?: (err: any) => void;
}

export function createPoller<T>(options: PollingOptions<T>): DataPoller {
  const manualRefresh$ = new Subject<void>();
  const stopPolling$ = new Subject<void>();
  const maxInterval = options.maxInterval ?? 570000;

  const visibility$ = merge(
    defer(() => of(document.hidden)),
    fromEvent(document, 'visibilitychange').pipe(map(() => document.hidden))
  ).pipe(distinctUntilChanged());

  const pollStream$ = merge(
    visibility$.pipe(map((isHidden) => ({ isHidden }))),
    manualRefresh$.pipe(map(() => ({ isHidden: document.hidden })))
  ).pipe(
    switchMap(({ isHidden }) => {
      const currentInterval = isHidden ? maxInterval : options.interval;

      return defer(() => options.fnServiceCall()).pipe(
        switchMap((data) => {
          options.fnDataProcess?.(data);
          return of(data);
        }),
        options.fnDistinctValues ? distinctUntilChanged(options.fnDistinctValues) : (src) => src,
        catchError((err) => {
          if (options.fnOnError) options.fnOnError(err);
          stopPolling$.next();
          return of(null);
        }),
        repeat({ delay: currentInterval })
      );
    }),
    takeUntil(stopPolling$)
  );

  const subscription = pollStream$.subscribe();

  const teardown = () => {
    subscription.unsubscribe();
    stopPolling$.next();
    stopPolling$.complete();
    manualRefresh$.complete();
  };

  options.destroyRef.onDestroy(teardown);

  return {
    next: () => manualRefresh$.next(),
    unsubscribe: teardown
  };
}
