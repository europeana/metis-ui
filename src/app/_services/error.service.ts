import { Injectable } from '@angular/core';

import { AuthenticationService } from '../_services/authentication.service';
import { RedirectPreviousUrl } from '../_services/redirect-previous-url.service';

import { Router } from '@angular/router';

@Injectable()
export class ErrorService {

  constructor(private authentication: AuthenticationService,
    private router: Router,
    private RedirectPreviousUrl: RedirectPreviousUrl) { }

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

  /** expiredToken
  /* if token expired: remember current url,
  /* logout,
  /* navigato to signin page
  */ 
  expiredToken() {
  	this.RedirectPreviousUrl.set(this.router.url);
    this.authentication.logout();
    this.router.navigate(['/signin']);    
  }

}
