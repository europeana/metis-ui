import { NextObserver, Observable } from 'rxjs';

export class TestSubscriber<Value> implements NextObserver<Value> {
  values: Value[] = [];
  // tslint:disable-next-line: no-any
  errors: any[] = [];

  next(value: Value): void {
    this.values.push(value);
  }

  // tslint:disable-next-line: no-any
  error(err: any): void {
    this.errors.push(err);
  }
}

export function gatherValues<Value>(observable: Observable<Value>): Value[] {
  const subscriber = new TestSubscriber<Value>();
  observable.subscribe(subscriber);
  return subscriber.values;
}

// tslint:disable-next-line: no-any
export function gatherErrors<Value>(observable: Observable<Value>): any[] {
  const subscriber = new TestSubscriber<Value>();
  observable.subscribe(subscriber);
  return subscriber.errors;
}
