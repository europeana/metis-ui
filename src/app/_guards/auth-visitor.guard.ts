import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthenticationService } from '../_services';

@Injectable()
export class AuthVisitorGuard implements CanActivate {
  constructor(private router: Router, private authentication: AuthenticationService) {}

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
