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

const STATUS_OK = 200;
const STATUS_UNAUTHORIZED = 401;
const STATUS_NOT_ACCEPTABLE = 406;
const STATUS_CONFLICT = 409;
const STATUS_BAD_REQUEST = 400;

export function shouldRetry(error: HttpErrorResponse): Observable<number> {
  const status = parseInt(`${error.status}`);
  if (![STATUS_OK, STATUS_UNAUTHORIZED, STATUS_NOT_ACCEPTABLE, STATUS_CONFLICT].includes(status)) {
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
          // log out
          if ([STATUS_BAD_REQUEST, STATUS_UNAUTHORIZED].includes(res.status)) {
            keycloak.logout({ redirectUri: window.location.href });
          }
        }
      })
    );
  };
}
