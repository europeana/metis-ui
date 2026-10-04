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
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subscription, throwError } from 'rxjs';
import Keycloak from 'keycloak-js';
import { mockedKeycloak } from 'shared';

import { errorInterceptor } from '.';

describe('errorInterceptor', () => {
  let keycloak: Keycloak;
  let dependencies: Array<object>;
  let retriesAttempted = 0;
  let sub: Subscription;
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
  const fnShouldRetrySynchronous = (error: HttpErrorResponse): Observable<number> => {
    retriesAttempted += 1;
    const status = parseInt(`${error.status}`);
    const STATUS_OK = 200;
    const STATUS_UNAUTHORIZED = 401;
    const STATUS_NOT_ACCEPTABLE = 406;
    const STATUS_CONFLICT = 409;

    if (
      ![STATUS_OK, STATUS_UNAUTHORIZED, STATUS_NOT_ACCEPTABLE, STATUS_CONFLICT].includes(status)
    ) {
      return of(0);
    }
    throw error;
  };

  const runInterceptorWithDI = (request: HttpRequest<unknown>, fnNext: HttpHandlerFn): void => {
    runInInjectionContext(
      {
        get: <T>(_: ProviderToken<T>): T => {
          return dependencies.pop() as T;
        }
      },
      () => {
        sub = errorInterceptor(fnShouldRetrySynchronous)(request, fnNext).subscribe({
          error: () => {}
        });
      }
    );
  };

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

  it('should not retry on a 200', () => {
    testRequest(200);
    expect(retriesAttempted).toEqual(0);
  });

  it('should not retry on a 406', () => {
    testRequest(406);
    expect(retriesAttempted).toEqual(1);
  });

  it('should not retry on a 409', () => {
    testRequest(409);
    expect(retriesAttempted).toEqual(1);
  });

  it('should retry on a 404', () => {
    testRequest(404, urlSignIn);
    expect(retriesAttempted).toEqual(2);
  });

  it('should logout on a 401', () => {
    spyOn(keycloak, 'logout');
    testRequest(401);
    expect(keycloak.logout).toHaveBeenCalled();
  });

  it('should logout on a 400', () => {
    spyOn(keycloak, 'logout');
    testRequest(400);
    expect(keycloak.logout).toHaveBeenCalled();
  });

  it('should not logout on a 400 for proxy urls', () => {
    spyOn(keycloak, 'logout');
    testRequest(400, '/proxies/123');
    expect(keycloak.logout).not.toHaveBeenCalled();
  });
});
