import { ConnectableObservable, Observable } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<Value> {
  private observable?: Observable<Value>;

  constructor(private sourceFn: () => Observable<Value>) {}

  public get(refresh: boolean = false): Observable<Value> {
    if (this.observable && !refresh) {
      return this.observable;
    }
    this.observable = this.sourceFn().pipe(
      tap(undefined, () => {
        this.clear();
      }),
      publishLast(),
    );
    (this.observable as ConnectableObservable<Value>).connect();
    return this.observable;
  }

  public clear(): void {
    this.observable = undefined;
  }
}

export class KeyedCache<Value> {
  private observableByKey: { [key: string]: Observable<Value> } = {};

  constructor(private sourceFn: (key: string) => Observable<Value>) {}

  public get(key: string, refresh: boolean = false): Observable<Value> {
    let observable = this.observableByKey[key];
    if (observable && !refresh) {
      return observable;
    }
    observable = this.sourceFn(key).pipe(
      tap(undefined, () => {
        this.clear(key);
      }),
      publishLast(),
    );
    (observable as ConnectableObservable<Value>).connect();
    this.observableByKey[key] = observable;
    return observable;
  }

  public clear(key: string): void {
    delete this.observableByKey[key];
  }
}
