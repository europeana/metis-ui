import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NextObserver, Observable } from 'rxjs';

export class TestSubscriber<Value> implements NextObserver<Value> {
  values: Value[] = [];
  // tslint:disable-next-line: no-any
  errors: any[] = [];
  // tslint:disable-next-line: no-any
  all: any[] = [];

  next(value: Value): void {
    this.values.push(value);
    this.all.push(value);
  }

  // tslint:disable-next-line: no-any
  error(err: any): void {
    this.errors.push(err);
    this.all.push(err);
  }
}

function gather<Value>(observable: Observable<Value>): TestSubscriber<Value> {
  const subscriber = new TestSubscriber<Value>();
  observable.subscribe(subscriber);
  return subscriber;
}

export function gatherValues<Value>(observable: Observable<Value>): Value[] {
  return gather(observable).values;
}

// tslint:disable-next-line: no-any
export function gatherErrors<Value>(observable: Observable<Value>): any[] {
  return gather(observable).errors;
}

export class MockHttpRequest {
  private hasBody = false;
  public isClosed = false;

  constructor(private req: TestRequest, public url: string) {}

  // tslint:disable-next-line: no-any
  public body(body: any): MockHttpRequest {
    expect(this.req.request.body).toEqual(body);
    this.hasBody = true;
    return this;
  }

  public header(key: string, value: string): MockHttpRequest {
    expect(this.req.request.headers.get(key)).toBe(value);
    return this;
  }

  public basicAuth(value: string): MockHttpRequest {
    return this.header('Authorization', 'Basic ' + value);
  }

  // tslint:disable-next-line: no-any
  public send(data: any): void {
    if (!this.hasBody) {
      if (this.req.request.body) {
        expect(this.req.request.body).toEqual({});
      } else {
        expect(this.req.request.body).toEqual(null);
      }
    }
    this.req.flush(data);
    this.isClosed = true;
  }
}

export class MockHttp {
  private openRequests: MockHttpRequest[] = [];

  constructor(private controller: HttpTestingController, private prefix: string = '') {}

  public expect(method: string, url: string): MockHttpRequest {
    const req = this.controller.expectOne(this.prefix + url);
    expect(req.request.method).toBe(method);
    const mockHttp = new MockHttpRequest(req, url);
    this.openRequests.push(mockHttp);
    return mockHttp;
  }

  public verify(): void {
    this.openRequests.forEach((r) => {
      if (!r.isClosed) {
        expect('request for ' + r.url).toBe('closed');
      }
    });
    this.controller.verify();
  }
}
