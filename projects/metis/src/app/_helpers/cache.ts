import { ConnectableObservable, Observable, of } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<Value> {
  private observable?: Observable<Value>;

  constructor(private readonly sourceFn: () => Observable<Value>) {}

  /** get
  /* accessor for the observable variable
  */
  public get(refresh = false): Observable<Value> {
    if (this.observable && !refresh) {
      return this.observable;
    }
    const observable = (this.observable = this.sourceFn().pipe(
      tap(
        (_) => undefined,
        (_) => this.clear(),
        () => undefined
      ),
      publishLast()
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  /** peek
  /* return the observable or undefined as an observable
  */
  public peek(): Observable<Value | undefined> {
    return this.observable || of(undefined);
  }

  /** clear
  /* sets the observable to undefined
  */
  public clear(): void {
    this.observable = undefined;
  }
}

export class KeyedCache<Value> {
  private readonly observableByKey: { [key: string]: Observable<Value> | undefined } = {};

  constructor(private readonly sourceFn: (key: string) => Observable<Value>) {}

  /** get
  /* accessor for the observable variable
  */
  public get(key: string, refresh = false): Observable<Value> {
    const o = this.observableByKey[key];
    if (o && !refresh) {
      return o;
    }
    const observable = (this.observableByKey[key] = this.sourceFn(key).pipe(
      tap(
        (_) => undefined,
        (_) => this.clear(key),
        () => undefined
      ),
      publishLast()
    ));
    (observable as ConnectableObservable<Value>).connect();
    return observable;
  }

  /** peek
  /* return the observable or undefined as an observable
  */
  public peek(key: string): Observable<Value | undefined> {
    return this.observableByKey[key] || of(undefined);
  }

  /** clear
  /* sets the observable to undefined
  */
  public clear(key: string): void {
    delete this.observableByKey[key];
  }
}
