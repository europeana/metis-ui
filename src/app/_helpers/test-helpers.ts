import { HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { QueryList } from '@angular/core';
import { CodemirrorComponent } from 'ng2-codemirror';
import { Observable } from 'rxjs';
import { reduce } from 'rxjs/operators';

export function gatherValues<Value>(observable: Observable<Value>): Value[] {
  const values: Value[] = [];
  observable.subscribe((value) => {
    values.push(value);
  });
  return values;
}

export function gatherValuesAsync<Value>(observable: Observable<Value>): Observable<Value[]> {
  return observable.pipe(
    reduce((acc: Array<Value>, value) => {
      return acc.concat(value);
    }, [])
  );
}

// tslint:disable-next-line: no-any
export function gatherError<Value>(observable: Observable<Value>): any {
  let error;
  observable.subscribe({
    error: (e) => {
      error = e;
    }
  });
  return error;
}

export function getCodeMirrorEditors(): QueryList<CodemirrorComponent> {
  return ([
    {
      instance: {
        setOption: jasmine.createSpy('setEditorOption')
      }
    }
    // tslint:disable-next-line
  ] as any) as QueryList<CodemirrorComponent>;
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

  public expectMulti(method: string, url: string, count: number): MockHttpRequest[] {
    const reqs = this.controller.match(this.prefix + url);
    expect(reqs.length).toBe(count);
    return reqs.map((req) => {
      expect(req.request.method).toBe(method);
      const mockHttp = new MockHttpRequest(req, url);
      this.openRequests.push(mockHttp);
      return mockHttp;
    });
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
