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
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { LoginComponent } from '../login';
import { RedirectPreviousUrl } from './redirect-previous-url.service';
import { errorInterceptor, shouldRetry } from '.';

describe('errorInterceptor', () => {
  let router: Router;
  let redirectPreviousUrl: RedirectPreviousUrl;
  let dependencies: Array<Object>;
  let retriesAttempted = 0;
  const tickTime = 1000;
  const urlSignIn = 'signin';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: urlSignIn, component: LoginComponent }])],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents();
    router = TestBed.inject(Router);
    redirectPreviousUrl = TestBed.inject(RedirectPreviousUrl);
    dependencies = [redirectPreviousUrl, router];
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
        // eslint-disable-next-line rxjs/no-ignored-subscription
        errorInterceptor(fnShouldRetry)(request, fnNext).subscribe({
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          error: () => {}
        });
      }
    );
  };

  // Create request and send to interceptor
  const testRequest = (statusCode: number, url = '/dashboard'): void => {
    spyOn(router, 'navigateByUrl');
    spyOn(redirectPreviousUrl, 'set');

    const request = new HttpRequest('GET', url);

    runInterceptorWithDI(request, (_: HttpRequest<unknown>) => {
      if (statusCode === 200) {
        return of(({ status: 200 } as unknown) as HttpEvent<Object>);
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
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(redirectPreviousUrl.set).not.toHaveBeenCalled();
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

  it('should redirect on a 401', fakeAsync(() => {
    router.navigateByUrl(urlSignIn);
    tick(tickTime);
    testRequest(401);
    expect(router.navigateByUrl).toHaveBeenCalled();
    expect(redirectPreviousUrl.set).not.toHaveBeenCalled();
  }));

  it('should redirect on a 401 (logout and set a previous url)', () => {
    localStorage.setItem('currentUser', 'user1');
    testRequest(401);
    expect(router.navigateByUrl).toHaveBeenCalled();
    expect(redirectPreviousUrl.set).toHaveBeenCalled();
    expect(localStorage.getItem('currentUser')).toBeFalsy();
  });
});
