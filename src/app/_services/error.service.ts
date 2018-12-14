import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of as observableOf, throwError } from 'rxjs';
import { concat, delay, flatMap, retryWhen, take } from 'rxjs/operators';

import { RedirectPreviousUrl } from './redirect-previous-url.service';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(private router: Router, private redirectPreviousUrl: RedirectPreviousUrl) {}

  numberOfRetries = 5;
  retryDelay = 1000;

  /** handleError
  /* default error handler
  /* check for specific error message, and act upon
  /* @param {object} err - details of error
  */
  handleError(err: HttpErrorResponse): HttpErrorResponse | false {
    if (err.status === 401 || err.error.errorMessage === 'Wrong access token') {
      this.expiredToken();
      return false;
    } else {
      return err;
    }
  }

  /** handleRetry
  /* retry http call
  /* check and retry for a specific error
  */
  handleRetry<T>(): (o: Observable<T>) => Observable<T> {
    return retryWhen<T>((error) => {
      return (
        error
          .pipe(
            flatMap((errorM: HttpErrorResponse) => {
              if (
                errorM.status === 0 ||
                errorM.message === 'Http failure response for (unknown url): 0 Unknown Error'
              ) {
                return observableOf(errorM.status).pipe(delay(this.retryDelay));
              }
              throw errorM;
            }),
          )
          .pipe(take(this.numberOfRetries))
          // tslint:disable-next-line: deprecation
          .pipe(concat(throwError({ status: 0, error: { errorMessage: 'Retry failed' } })))
      );
    });
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
