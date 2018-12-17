import { ConnectableObservable, Observable } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<T> {
  private observable?: Observable<T>;

  constructor(private sourceFn: () => Observable<T>) {}

  public get(): Observable<T> {
    if (this.observable) {
      return this.observable;
    }
    this.observable = this.sourceFn().pipe(
      tap(undefined, () => {
        this.observable = undefined;
      }),
      publishLast(),
    );
    (this.observable as ConnectableObservable<T>).connect();
    return this.observable;
  }
}
