import { ConnectableObservable, Observable, of } from 'rxjs';
import { publishLast, tap } from 'rxjs/operators';

export class SingleCache<Value> {
  private observable?: ConnectableObservable<Value>;

  constructor(private readonly sourceFn: () => Observable<Value>) {}

  /** get
  /* accessor for the observable variable
  */
  public get(refresh = false): Observable<Value> {
    // If already cached, return.
    if (this.observable && !refresh) {
      return this.observable;
    }

    // Create new observable.
    const observable = this.sourceFn().pipe(
      tap(
        (_) => undefined,
        (_) => this.clear(),
        () => undefined
      ),
      publishLast()
    ) as ConnectableObservable<Value>;

    // Return local variable, as this.observable might be cleared by the connect call.
    this.observable = observable;
    observable.connect();
    return observable;
  }

  /** peek
  /* return the observable or undefined as an observable
  */
  public peek(): Observable<Value | undefined> {
    return this.observable || of(void 0);
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
    // If already cached, return.
    const o = this.observableByKey[key];
    if (o && !refresh) {
      return o;
    }

    // Create new observable.
    const observable = this.sourceFn(key).pipe(
      tap(
        (_) => undefined,
        (_) => this.clear(key),
        () => undefined
      ),
      publishLast()
    ) as ConnectableObservable<Value>;

    // Return local variable, as this.observableByKey[key] might be cleared by the connect call.
    this.observableByKey[key] = observable;
    observable.connect();
    return observable;
  }

  /** peek
  /* return the observable or undefined as an observable
  */
  public peek(key: string): Observable<Value | undefined> {
    return this.observableByKey[key] || of(void 0);
  }

  /** clear
  /* sets the observable to undefined
  */
  public clear(key: string): void {
    delete this.observableByKey[key];
  }
}
