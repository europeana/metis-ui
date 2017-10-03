import { Injectable } from '@angular/core';

@Injectable()
export class AuthenticationService {

	userInfo = {
  	  id: 1, 
  	  name: 'Mirjam',
      organization: 'Europeana',
      role: 'admin', 
      approved: true
	};

	getAuthenticationStatus() {
		return this.userInfo;
	} 

	// working with authentication, ldap

}