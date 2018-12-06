﻿import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(
    private authentication: AuthenticationService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private redirectPreviousUrl: RedirectPreviousUrl,
  ) {}

  canActivate(): boolean {
    if (this.authentication.validatedUser()) {
      // logged in so return true
      return true;
    }

    // save original url to be redirected to after signin
    this.redirectPreviousUrl.set(this.document.location!.href.split('/')[3]);

    // not logged in so redirect to signin page
    this.router.navigate(['/signin']);
    return false;
  }
}
