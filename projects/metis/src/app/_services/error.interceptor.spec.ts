import { ProviderToken, runInInjectionContext } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subscription, throwError } from 'rxjs';
import Keycloak from 'keycloak-js';
import { mockedKeycloak } from 'shared';

import { errorInterceptor, shouldRetry } from '.';

describe('errorInterceptor', () => {
  let keycloak: Keycloak;
  let dependencies: Array<object>;
  let retriesAttempted = 0;
  let sub: Subscription;
  const tickTime = 1000;
  const urlSignIn = 'signin';

  afterAll(() => {
    if (sub) {
      sub.unsubscribe();
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: Keycloak,
          useValue: mockedKeycloak
        }
      ]
    }).compileComponents();
    keycloak = TestBed.inject(Keycloak);
    dependencies = [keycloak];
    retriesAttempted = 0;
  });

  // Wrap the default shouldRetry function with one that bumps the retriesAttempted variable
  const fnShouldRetry = (error: HttpErrorResponse): Observable<number> => {
    retriesAttempted += 1;
    return shouldRetry(error);
  };

  // Load the interceptor function in a context where dependencies can be injected
  const runInterceptorWithDI = (request: HttpRequest<unknown>, fnNext: HttpHandlerFn): void => {
    runInInjectionContext(
      {
        get: <T>(_: ProviderToken<T>): T => {
          return dependencies.pop() as T;
        }
      },
      () => {
        sub = errorInterceptor(fnShouldRetry)(request, fnNext).subscribe({
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {}
        });
      }
    );
  };

  // Create request and send to interceptor
  const testRequest = (statusCode: number, url = '/dashboard'): void => {
    const request = new HttpRequest('GET', url);

    runInterceptorWithDI(request, (_: HttpRequest<unknown>) => {
      if (statusCode === 200) {
        return of(({ status: 200 } as unknown) as HttpEvent<object>);
      }
      return throwError({
        status: statusCode,
        statusText: 'status text',
        error: 'error response'
      } as HttpErrorResponse);
    });
  };

  it('should not retry on a 200', fakeAsync(() => {
    testRequest(200);
    tick(tickTime);
    expect(retriesAttempted).toEqual(0);
  }));

  it('should not retry on a 406', fakeAsync(() => {
    testRequest(200);
    tick(tickTime);
    expect(retriesAttempted).toEqual(0);
  }));

  it('should not retry on a 409', fakeAsync(() => {
    testRequest(200);
    tick(tickTime);
    expect(retriesAttempted).toEqual(0);
  }));

  it('should retry on a 404', fakeAsync(() => {
    testRequest(404, urlSignIn);
    expect(retriesAttempted).toEqual(1);
    tick(tickTime);
    expect(retriesAttempted).toEqual(2);
    tick(tickTime);
    expect(retriesAttempted).toEqual(2);
  }));

  it('should logout on a 401', () => {
    spyOn(keycloak, 'logout');
    testRequest(401);
    expect(keycloak.logout).toHaveBeenCalled();
  });
});
