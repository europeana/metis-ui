import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthenticationService } from '../_services';

@Injectable()
export class AuthVisitorGuard implements CanActivate {

  constructor( private authentication: AuthenticationService ) { }

    canActivate() {
      return !this.authentication.validatedUser();
    }
}
