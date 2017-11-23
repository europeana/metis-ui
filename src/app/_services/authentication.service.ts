import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';
import { User } from '../_models';

@Injectable()
export class AuthenticationService {

  private readonly key = 'currentUser';

  private token: string;

  public currentUser = null;

  constructor(public router: Router,
              private http: HttpClient) {
    // set currentUser and token if already saved in local storage
    const value = localStorage.getItem(this.key);
    if (value) {
      const hash = JSON.parse(value);
      this.currentUser = hash.user;
      this.token = hash.token;
    }
  }

  validatedUser(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  getToken(): string {
    const s = localStorage.getItem(this.key);
    if (!s)  {
      return null;
    }
    const h = JSON.parse(s);
    return h.token;
  }

  updatePassword(password: string) {
    const fn = `updatePassword(password='${password}'`;
    const url = `${environment.apiHost}/${environment.apiUpdatePassword}?newPassword=${password}`;
    return this.http.put(url, JSON.stringify('{}')).map(data => {
      // update successful
      console.log(`${fn} PUT ${url} => OK`);
      return true;
    });
  }

  register(email: string, password: string) {
    const fn = `register(email='${email}',password='${password}'`;
    const url = `${environment.apiHost}/${environment.apiRegister}`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post(url, JSON.stringify('{}'), { headers: headers }).map(data => {
      // registration successful
        console.log(`${fn} POST ${url} => OK`);
        return true;
      });
  }

  login(email: string, password: string) {
    const fn = `login(email='${email}',password='${password}')`;
    const url = `${environment.apiHost}/${environment.apiLogin}`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post(url, JSON.stringify('{}'), { headers: headers }).map(data => {
      const user = <User>data;
      if (user && user.metisUserAccessToken) {

        this.setCurrentUser(user);

        // return true to indicate successful login
        console.log(`${fn} POST ${url} => OK`);
        return true;
      } else {
        // return false to indicate failed login
        console.log(`${fn} POST ${url} => NOK (token missing)`);
        return false;
      }
    });
  }

  logout(): void {
    const fn = 'logout()';
    // clear token remove user from local storage to log user out
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem(this.key);
    console.log(`${fn} => OK`);
  }

  reloadCurrentUser() {
    const fn = 'reloadCurrentUser()';
    const url = `${environment.apiHost}/${environment.apiProfile}`;
    return this.http.get(url, JSON.stringify('{}')).map(data => {
      const user = <User>data;
      if (user) {

        this.setCurrentUser(user);

        // return true to indicate success
        console.log(`${fn} GET ${url} => OK`);
        return true;
      } else {
        // return false to indicate fail
        console.log(`${fn} GET ${url} => NOK`);
        return false;
      }
    });
  }

  private setCurrentUser(user: User) {
    this.currentUser = user;
    this.token = user.metisUserAccessToken.accessToken;

    // store email and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem(this.key, JSON.stringify({ user: user, email: user.email, token: this.token}));
  }
}
