import { DestroyRef, inject } from '@angular/core';
import { defer, fromEvent, merge, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, repeat, switchMap } from 'rxjs/operators';

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
  const maxInterval = options.maxInterval ?? 570000; // 9.5 minutes

  const visibility$ = merge(
    defer(() => of(document.hidden)),
    fromEvent(document, 'visibilitychange').pipe(map(() => document.hidden))
  ).pipe(distinctUntilChanged());

  // trigger stream manual refresh is either a focus change or a state update
  const pollStream$ = merge(
    visibility$.pipe(map((isHidden) => ({ isHidden }))),
    manualRefresh$.pipe(map(() => ({ isHidden: document.hidden })))
  ).pipe(
    switchMap(({ isHidden }) => {
      // determine the interval delay based on the window's state
      const currentInterval = isHidden ? maxInterval : options.interval;

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
        repeat({ delay: currentInterval })
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
