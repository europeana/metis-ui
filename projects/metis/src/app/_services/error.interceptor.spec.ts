import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subscription, throwError } from 'rxjs';
import { ErrorInterceptor } from '.';

describe('ErrorInterceptor', () => {
  let service: ErrorInterceptor;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorInterceptor],
      imports: [HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
    service = TestBed.inject(ErrorInterceptor);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.removeItem('currentUser');
  });

  const getErrorResponse = (errorCode: number): HttpErrorResponse => {
    return new HttpErrorResponse({
      status: errorCode,
      statusText: 'status text',
      error: 'error response'
    });
  };

  const getHandler = (responseCode = 200): HttpHandler => {
    return ({
      // this is the function that gets piped to the retry
      handle: () => {
        if (responseCode !== 200) {
          return throwError(getErrorResponse(responseCode));
        } else {
          return of({ status: responseCode });
        }
      }
    } as unknown) as HttpHandler;
  };

  const instantBailout = (responseCode = 200): boolean => {
    let result = false;
    let sub: Subscription;
    try {
      sub = service.shouldRetry(getErrorResponse(responseCode)).subscribe(
        () => {
          // success
        },
        () => {
          // fail
        },
        () => {
          // finally
          sub.unsubscribe();
        }
      );
    } catch (e) {
      result = true;
    }
    return result;
  };

  it('should intercept', () => {
    const handler = getHandler();
    spyOn(handler, 'handle').and.callThrough();
    const sub = service.intercept(new HttpRequest('GET', '/dashboard'), handler).subscribe();
    expect(handler.handle).toHaveBeenCalled();
    sub.unsubscribe();
  });

  it('should retry', fakeAsync(() => {
    const handler = getHandler(500);
    spyOn(service, 'shouldRetry').and.callThrough();

    const req = new HttpRequest('GET', '/dashboard');
    const sub = service.intercept(req, handler).subscribe();

    expect(service.shouldRetry).toHaveBeenCalledTimes(1);
    tick(ErrorInterceptor.retryDelay);
    expect(service.shouldRetry).toHaveBeenCalledTimes(2);

    try {
      tick(ErrorInterceptor.retryDelay);
    } catch (e) {
      // there are no more retries so catch the thrown error
    }

    expect(service.shouldRetry).toHaveBeenCalledTimes(2);
    // there are no further errors as the retry notification variable has completed
    tick(ErrorInterceptor.retryDelay);
    expect(service.shouldRetry).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
  }));

  it('should expire the session and redirect to the login page on a 401', fakeAsync(() => {
    localStorage.setItem('currentUser', 'user1');
    spyOn(router, 'navigateByUrl');
    spyOn(service, 'shouldRetry').and.callThrough();

    const handler = getHandler(401);
    const observable = service.intercept(new HttpRequest('GET', '/dashboard'), handler);
    let sub: Subscription | null = null;

    try {
      sub = observable.subscribe();
      tick(ErrorInterceptor.retryDelay);
    } catch {
      if (sub) {
        sub.unsubscribe();
      }
    }
    expect(service.shouldRetry).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/signin');
    expect(localStorage.getItem('currentUser')).toBeFalsy();
  }));

  it('should not retry on codes 200, 401 and 406', () => {
    localStorage.setItem('currentUser', 'user1');
    expect(instantBailout(200)).toBeTruthy();
    expect(instantBailout(401)).toBeTruthy();
    expect(instantBailout(406)).toBeTruthy();
  });
});
