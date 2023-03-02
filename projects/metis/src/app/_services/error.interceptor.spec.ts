import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subscription, throwError } from 'rxjs';
import { ErrorInterceptor } from '.';

describe('ErrorInterceptor', () => {
  let service: ErrorInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorInterceptor],
      imports: [HttpClientTestingModule]
    }).compileComponents();
    service = TestBed.inject(ErrorInterceptor);
  });

  const getErrorResponse = (errorCode: number): HttpErrorResponse => {
    return new HttpErrorResponse({
      status: errorCode,
      statusText: 'status text',
      error: 'error response' //new Error('error response')
    });
  };

  const getHandler = (responseCode = 200): HttpHandler => {
    console.log('getHandler responseCode ' + responseCode);

    return ({
      // this is the function that gets piped to the retry
      handle: () => {
        if (responseCode !== 200) {
          console.log('handler throws fake err');
          return throwError(getErrorResponse(responseCode));
        } else {
          console.log('handler returns ' + responseCode);
          return of({ status: responseCode });
        }
      }
    } as unknown) as HttpHandler;
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
      console.log('(catch the thrown error)');
    }

    expect(service.shouldRetry).toHaveBeenCalledTimes(2);
    tick(ErrorInterceptor.retryDelay);
    expect(service.shouldRetry).toHaveBeenCalledTimes(2);
    sub.unsubscribe();
  }));

  it('should not retry on code 200', () => {
    let instantBailout = false;
    let sub: Subscription;
    try {
      sub = service.shouldRetry(getErrorResponse(200)).subscribe(
        () => {},
        () => {
          sub.unsubscribe();
        }
      );
    } catch (e) {
      instantBailout = true;
    }
    expect(instantBailout).toBeTruthy();
  });

  it('should not retry on 406', () => {
    let instantBailout = false;
    let sub: Subscription;
    try {
      sub = service.shouldRetry(getErrorResponse(406)).subscribe(
        () => {},
        () => {
          sub.unsubscribe();
        }
      );
    } catch (e) {
      instantBailout = true;
    }
    expect(instantBailout).toBeTruthy();
  });
});
