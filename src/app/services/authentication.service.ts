import { Injectable } from '@angular/core';
import { Router }   from '@angular/router';

@Injectable()

export class AuthenticationService {

  constructor(public router: Router) { }

	userInfo = {
	  id: 1, 
	  name: 'Mirjam',
    organization: 'Europeana',
    role: 'admin', 
    approved: true
	};

  validateUser(formvalues) {
    if (formvalues.get('email').value === 'mirjam.verloop@europeana.eu' && formvalues.get('password').value === 'test123') {
      // retrieve userinfo + send to profile
      sessionStorage.setItem('currentUser', JSON.stringify(this.userInfo));
      this.router.navigate(['profile']);
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
      this.router.navigate(['profile']);
    }
  }

	getUserInfo() {
		return this.userInfo;
	} 

	// working with authentication, ldap

}