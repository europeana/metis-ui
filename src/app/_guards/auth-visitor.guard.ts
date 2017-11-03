import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable()
export class AuthVisitorGuard implements CanActivate {

    canActivate() {
      return sessionStorage.getItem('currentUser') === null;
    }
}
