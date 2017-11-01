import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { User } from '../_models/index';

@Injectable()
export class AuthenticationService {

  private readonly key = 'currentUser';
  private readonly url = '/api/authenticate';

  public currentUser: User;
  public token: string;

  constructor(public router: Router, private http: Http) {
    // set currentUser and token if already saved in local storage
    const value = localStorage.getItem(this.key);
    if (value) {
      const hash = JSON.parse(value);
      this.currentUser = hash.user;
      this.token = hash.token;
    }
  }

  logIn(email: string, password: string): Observable<boolean> {
    const value = { email: email, password: password };
    return this.http.post(this.url, JSON.stringify(value)).map((response: Response) => {
      // login successful if there's a jwt token in the response
      const user: User = response.json();
      if (user && user.metisUserToken) {
        // set token property
        this.currentUser = user;
        this.token = user.metisUserToken.accessToken;

        // store email and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem(this.key, JSON.stringify({ user: user, email: email, token: this.token }));

        // return true to indicate successful login
          return true;
      } else {
        // return false to indicate failed login
        return false;
      }
    });
  }

  redirectProfile(): void {
    if (this.currentUser) {
      this.router.navigate(['profile']);
    }
  }

  logOut(): void {
    // clear token remove user from local storage to log user out
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem(this.key);
  }
}
