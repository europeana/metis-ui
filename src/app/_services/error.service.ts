import { Injectable } from '@angular/core';
import { RedirectPreviousUrl } from '../_services/redirect-previous-url.service';

import { Router } from '@angular/router';
import { retryWhen, delay, take, flatMap, concat } from 'rxjs/operators';
import {of as observableOf,  Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorService {

  constructor(private router: Router,
    private RedirectPreviousUrl: RedirectPreviousUrl) { }

  numberOfRetries: number = 1;
  retryDelay: number = 1000;

  /** handleError
  /* default error handler
  /* check for specific error message, and act upon
  /* @param {object} err - details of error
  */  
  handleError(err) {
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
  handleRetry() {
    return retryWhen(error => {
      return error.pipe(flatMap((error: any) => {
        if(error.status  === 0) {
          return observableOf(error.status).pipe(delay(this.retryDelay))
        }
        throw error;
      })).pipe(take(this.numberOfRetries))
        .pipe(concat(throwError({ status: 0, error: {errorMessage: 'Retry failed'}})));
    })
  }

  /** expiredToken
  /* if token expired: remember current url,
  /* logout,
  /* navigato to signin page
  */ 
  expiredToken() {
  	this.RedirectPreviousUrl.set(this.router.url);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/signin']);    
  }

}
