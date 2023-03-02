// https://blog.adnanhalilovic.com/2022/07/31/retry-error-http-requests-in-angular-without-retrywhen/

import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, retry, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  numberOfRetries = 2;
  static retryDelay = 1000;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next
      .handle(request)
      .pipe(retry({ count: this.numberOfRetries, delay: this.shouldRetry }));
  }

  shouldRetry(error: HttpErrorResponse): Observable<number> {
    const status = parseInt(`${error.status}`);

    // TODO: merge these ifs

    if (status === 401) {
      // unauthorised requests are not retried (so original error thrown)
      console.log('throw unauthorised');
      throw error;
    }

    if (![200, 406].includes(status)) {
      console.log('shouldRetry()... delay... ' + ErrorInterceptor.retryDelay);
      return timer(ErrorInterceptor.retryDelay);
    }

    throw error;
  }
}
