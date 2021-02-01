import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { concat, Observable, of, throwError } from 'rxjs';
import { delay, flatMap, retryWhen, take } from 'rxjs/operators';

import { RedirectPreviousUrl } from './redirect-previous-url.service';
import { TranslateService } from '../_translate';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(
    private readonly router: Router,
    private readonly redirectPreviousUrl: RedirectPreviousUrl,
    private readonly translate: TranslateService
  ) {}

  numberOfRetries = 5;
  retryDelay = 1000;

  /** handleError
  /* default error handler
  /* check for specific error message, and act upon
  /* @param {object} err - details of error
  */
  handleError(err: HttpErrorResponse): HttpErrorResponse | false {
    if (err.status === 401) {
      this.expiredToken();
      return false;
    } else {
      return err;
    }
  }

  private shouldRetry(errorM: HttpErrorResponse): boolean {
    return (
      errorM.status === 0 ||
      errorM.message === 'Http failure response for (unknown url): 0 Unknown Error'
    );
  }

  /** handleRetry
  /* retry http call
  /* check and retry for a specific error
  */
  handleRetry<T>(): (o: Observable<T>) => Observable<T> {
    return retryWhen<T>((error) =>
      concat(
        error.pipe(
          flatMap((errorM: HttpErrorResponse) => {
            if (this.shouldRetry(errorM)) {
              return of(true).pipe(delay(this.retryDelay));
            } else {
              throw errorM;
            }
          }),
          take(this.numberOfRetries)
        ),
        throwError({
          status: 0,
          error: { errorMessage: this.translate.instant('errorRetryFailed') }
        } as HttpErrorResponse)
      )
    );
  }

  /** expiredToken
  /* if token expired: remember current url,
  /* logout,
  /* navigato to signin page
  */
  expiredToken(): void {
    this.redirectPreviousUrl.set(this.router.url);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/signin']);
  }
}
