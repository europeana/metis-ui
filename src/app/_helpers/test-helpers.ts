import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
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
