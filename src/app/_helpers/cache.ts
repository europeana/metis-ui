import { ConnectableObservable, Observable, of } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<Value> {
  private observable?: Observable<Value>;

  constructor(private sourceFn: () => Observable<Value>) {}

  public get(refresh: boolean = false): Observable<Value> {
    if (this.observable && !refresh) {
      return this.observable;
    }
    const observable = (this.observable = this.sourceFn().pipe(
      tap((_) => {}, (_) => this.clear(), () => {}),
      publishLast()
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  public peek(): Observable<Value | undefined> {
    return this.observable || of(undefined);
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
      tap((_) => {}, (_) => this.clear(key), () => {}),
      publishLast()
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  public peek(key: string): Observable<Value | undefined> {
    return this.observableByKey[key] || of(undefined);
  }

  public clear(key: string): void {
    delete this.observableByKey[key];
  }
}
