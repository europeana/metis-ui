import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, RedirectPreviousUrl } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthUserGuard {
  private readonly authentication = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly redirectPreviousUrl = inject(RedirectPreviousUrl);
  private readonly document: Document = inject(DOCUMENT);

  /** canActivate
  /* - return true if user is logged in
  /* - redirect to signin page if user is not logged in
  */
  canActivate(): boolean {
    if (this.authentication.validatedUser()) {
      // logged in so return true
      return true;
    }

    // save original url to be redirected to after signin
    const prevUrl = this.document.location.href
      .split('/')
      .slice(3)
      .join('/');
    this.redirectPreviousUrl.set(prevUrl);

    // not logged in so redirect to signin page
    this.router.navigate(['/signin']);
    return false;
  }
}
