import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, retry, tap, timer } from 'rxjs';
import { RedirectPreviousUrl } from './redirect-previous-url.service';

const numberOfRetries = 2;
const retryDelay = 1000;

export function shouldRetry(error: HttpErrorResponse): Observable<number> {
  const status = parseInt(`${error.status}`);
  if (![200, 401, 406].includes(status)) {
    return timer(retryDelay);
  }
  throw error;
}

const expireToken = (router: Router, redirectPreviousUrl: RedirectPreviousUrl): void => {
  if (router.url !== '/signin') {
    redirectPreviousUrl.set(router.url);
  }
  localStorage.removeItem('currentUser');
  router.navigateByUrl('/signin');
};

export function errorInterceptor(fnRetry = shouldRetry): HttpInterceptorFn {
  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const router = inject(Router);
    const redirectPreviousUrl = inject(RedirectPreviousUrl);
    return next(request).pipe(
      retry({ count: numberOfRetries, delay: fnRetry }),
      tap({
        error: (res) => {
          if ([401, 406].includes(res.status)) {
            expireToken(router, redirectPreviousUrl);
          }
        }
      })
    );
  };
}
