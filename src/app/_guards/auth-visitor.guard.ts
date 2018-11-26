import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../_services';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthVisitorGuard implements CanActivate {

  constructor( private router: Router,
    private authentication: AuthenticationService ) {}

  canActivate(): boolean {
    if (this.authentication.validatedUser() === false) {
      return true;
    } else {
      // user is loggedin: useless to visit eg signin and registrationpage again, so redirect
      this.router.navigate([environment.afterLoginGoto]);
      return false;
    }
  }
}
