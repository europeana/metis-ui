import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthenticationService } from '../_services';

@Injectable({ providedIn: 'root' })
export class AuthVisitorGuard {
  private readonly router = inject(Router);
  private readonly authentication = inject(AuthenticationService);

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
