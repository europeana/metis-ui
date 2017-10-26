import { Injectable, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()

export class AuthenticationService {

  // mock info
  userInfo = {
    id: 1,
    email: 'mirjam.verloop@europeana.eu',
    firstname: 'Mirjam',
    lastname: 'Verloop',
    organization: 'Europeana',
    country: 'Netherlands',
    skypeid: '',
    organizations: [{ id: 11, name: 'Europeana' }, { id: 12, name: 'KB' }],
    notes: 'ras ac turpis mi. Aenean urna nulla, finibus vel enim sit amet, dictum egestas nulla. Nam sagittis dui in mauris ornare',
    role: 'admin',
    approved: true,
    active: true,
    created: '25/10/2017',
    updated: '26/10/2017'
  };

  constructor(public router: Router) {}

  // mock login
  validateUser(formvalues) {
    if (formvalues.get('email').value === 'mirjam.verloop@europeana.eu' && formvalues.get('password').value === 'test123') {
      // retrieve userinfo + send to profile
      sessionStorage.setItem('userStatus', 'loggedin');
      this.router.navigate(['profile', this.userInfo['id']]);
    } else {
      // error
      return false;
    }
  }

  validatedUser() {
    return sessionStorage.getItem('userStatus');
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
    sessionStorage.removeItem('userStatus');
    this.redirectLogin();
  }

  getUserInfo(id) {
    return this.userInfo;
  }
}
