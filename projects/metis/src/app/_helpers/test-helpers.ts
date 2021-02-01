import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { QueryList } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Observable, Subscription } from 'rxjs';
import { reduce } from 'rxjs/operators';

/** getUnsubscribable
/* export Subscription utility
*/
export function getUnsubscribable(undef?: boolean): Subscription {
  return (undef
    ? undefined
    : ({
        unsubscribe: jasmine.createSpy('unsubscribe')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as Subscription;
}

/** gatherValues
/* export function for deriving array of values from an observable
*/
export function gatherValues<Value>(observable: Observable<Value>): Value[] {
  const values: Value[] = [];
  const sub = observable.subscribe((value) => {
    values.push(value);
  });
  sub.unsubscribe();
  return values;
}

/** gatherValuesAsync
/* export function for deriving array of values from an observable asychronously
*/
export function gatherValuesAsync<Value>(observable: Observable<Value>): Observable<Value[]> {
  return observable.pipe(
    reduce((acc: Array<Value>, value) => {
      return acc.concat(value);
    }, [])
  );
}

/** gatherError
/* export function for getting the error from an observable
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function gatherError<Value>(observable: Observable<Value>): any {
  let error;
  const subError = observable.subscribe({
    error: (e) => {
      error = e;
    }
  });
  subError.unsubscribe();
  return error;
}

/** getCodeMirrorEditors
/* export function for generating a representation of CodeMirror components
*/
export function getCodeMirrorEditors(): QueryList<CodemirrorComponent> {
  return ([
    {
      codeMirror: {
        setOption: jasmine.createSpy('setEditorOption')
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any) as QueryList<CodemirrorComponent>;
}

/** MockHttpRequest
/* class to imitate http requests
*/
export class MockHttpRequest {
  private hasBody = false;
  public isClosed = false;

  constructor(private readonly req: TestRequest, public url: string) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  private readonly openRequests: MockHttpRequest[] = [];

  constructor(private readonly controller: HttpTestingController, private readonly prefix = '') {}

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
