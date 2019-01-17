import { concat, ConnectableObservable, Observable } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<Value> {
  private observable?: Observable<Value>;

  constructor(private sourceFn: () => Observable<Value>) {}

  public get(refresh: boolean = false): Observable<Value> {
    if (this.observable && !refresh) {
      return this.observable;
    }
    const observable = (this.observable = this.sourceFn().pipe(
      tap(undefined, () => {
        this.clear();
      }),
      publishLast(),
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  public getStaleAndRefresh(): Observable<Value> {
    const oldObservable = this.observable;
    const newObservable = this.get(true);
    if (oldObservable) {
      return concat(oldObservable, newObservable);
    } else {
      return newObservable;
    }
  }

  public clear(): void {
    this.observable = undefined;
  }
}

export class KeyedCache<Value> {
  private observableByKey: { [key: string]: Observable<Value> | undefined } = {};

  constructor(private sourceFn: (key: string) => Observable<Value>) {}

  public get(key: string, refresh: boolean = false): Observable<Value> {
    const o = this.observableByKey[key];
    if (o && !refresh) {
      return o;
    }
    const observable = (this.observableByKey[key] = this.sourceFn(key).pipe(
      tap(undefined, () => {
        this.clear(key);
      }),
      publishLast(),
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  public getStaleAndRefresh(key: string): Observable<Value> {
    const oldObservable = this.observableByKey[key];
    const newObservable = this.get(key, true);
    if (oldObservable) {
      return concat(oldObservable, newObservable);
    } else {
      return newObservable;
    }
  }

  public clear(key: string): void {
    delete this.observableByKey[key];
  }
}
