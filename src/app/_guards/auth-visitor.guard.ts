import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthenticationService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthVisitorGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly authentication: AuthenticationService
  ) {}

  /** canActivate
  /* - return true if user is not logged in
  /* - redirect to environment-specified page if not logged in
  */
  canActivate(): boolean {
    if (!this.authentication.validatedUser()) {
      return true;
    } else {
      // user is loggedin: useless to visit eg signin and registrationpage again, so redirect
      this.router.navigate([environment.afterLoginGoto]);
      return false;
    }
  }
}
