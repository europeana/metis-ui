import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '../_services';

@Injectable()
export class AuthUserGuard implements CanActivate {

    constructor(private authentication: AuthenticationService, private router: Router) { }

    canActivate() {
        if (this.authentication.validatedUser()) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}
