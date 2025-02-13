import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import Keycloak from 'keycloak-js';
import { Observable, retry, tap, timer } from 'rxjs';
const numberOfRetries = 2;
const retryDelay = 1000;

export function shouldRetry(error: HttpErrorResponse): Observable<number> {
  const status = parseInt(`${error.status}`);
  if (![200, 401, 406].includes(status)) {
    return timer(retryDelay);
  }
  throw error;
}

export function errorInterceptor(fnRetry = shouldRetry): HttpInterceptorFn {
  return (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const keycloak = inject(Keycloak);
    return next(request).pipe(
      retry({ count: numberOfRetries, delay: fnRetry }),
      tap({
        error: async (res) => {
          if ([400, 401, 406].includes(res.status)) {
            keycloak.logout({ redirectUri: window.location.href });
          }
        }
      })
    );
  };
}
