import { Injectable, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()

export class AuthenticationService {

  userInfo = {
    id: 1,
    name: 'Mirjam',
    organization: 'Europeana',
    role: 'admin',
    approved: true
  };

  constructor(public router: Router) {}

  validateUser(formvalues) {
    if (formvalues.get('email').value === 'mirjam.verloop@europeana.eu' && formvalues.get('password').value === 'test123') {
      // retrieve userinfo + send to profile
      sessionStorage.setItem('currentUser', JSON.stringify(this.userInfo));
      this.router.navigate(['profile', this.userInfo['id']]);
    } else {
      // error
      return false;
    }
  }

  validatedUser() {
    return sessionStorage.getItem('currentUser');
  }

  redirectLogin() {
    if (!this.validatedUser()) {
      this.router.navigate(['login']);
    }
  }

  redirectProfile() {
    if (this.validatedUser()) {
      this.router.navigate(['profile', this.userInfo['id']]);
    }
  }

  logOut() {
    sessionStorage.removeItem('currentUser');
    this.redirectLogin();
  }

  getUserInfo(id) {
    return this.userInfo;
  }
}
