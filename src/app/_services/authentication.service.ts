import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../_models';

@Injectable()
export class AuthenticationService {

  private readonly key = 'currentUser';
  // private readonly url = '/authentication/login';
  private readonly url = 'http://metis-authentication-rest-test.eanadev.org/authentication/login';

  public currentUser = null;
  public token: string;

  constructor(public router: Router,
              private http: Http) {
    // set currentUser and token if already saved in local storage
    const value = sessionStorage.getItem(this.key);
    if (value) {
      const hash = JSON.parse(value);
      this.currentUser = hash.user;
      this.token = hash.token;
    }
  }

  validatedUser(): boolean {
    return sessionStorage.getItem(this.key) !== null;
  }

  login(email: string, password: string): Observable<boolean> {
    const body = '';
    const headers = new Headers({'Authorization': 'Basic ' + btoa(email + ':' + password)});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(this.url, body, options).map((response: Response) => {
      // login successful if there's a jwt token in the response
      const user: User = response.json();
      if (user && user.metisUserAccessToken) {
        // set token property
        this.currentUser = user;
        this.token = user.metisUserAccessToken.accessToken;

        // store email and jwt token in local storage to keep user logged in between page refreshes
        sessionStorage.setItem(this.key, JSON.stringify({ user: user, email: email, token: this.token }));

        // return true to indicate successful login
        return true;
      } else {
        // return false to indicate failed login
        return false;
      }
    });
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.currentUser = null;
    this.token = null;
    sessionStorage.removeItem(this.key);
  }
}
