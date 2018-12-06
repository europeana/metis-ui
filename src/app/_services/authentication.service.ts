import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RedirectPreviousUrl } from '../_services/redirect-previous-url.service';
import { ErrorService } from '../_services/error.service';

import { apiSettings } from '../../environments/apisettings';
import { environment } from '../../environments/environment';

import { User } from '../_models';

@Injectable()
export class AuthenticationService {

  private readonly key = 'currentUser';
  private token: string | null;
  public currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errors: ErrorService,
    private redirectPreviousUrl: RedirectPreviousUrl) {
    // set currentUser and token if already saved in local storage
    const value = localStorage.getItem(this.key);
    if (value) {
      const hash = JSON.parse(value);
      this.currentUser = hash.user;
      this.token = hash.token;
    } else {
      this.currentUser = null;
      this.token = null;
    }
  }

  /** validatedUser
  /* check if user is validated/allowed
  */
  validatedUser(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  /** getToken
  /* get token from user that is already logged in
  */
  getToken(): string | null {
    const s = localStorage.getItem(this.key);
    if (!s)  {
      return null;
    }
    const h = JSON.parse(s);
    return h.token;
  }

  /** updatePassword
  /* update password for this user
  /* @param {string} password - password
  */
  updatePassword(password: string, oldpassword: string): Observable<boolean> {
    const url = `${apiSettings.apiHostAuth}/authentication/update/password?newPassword=${password}&oldPassword=${oldpassword}`;
    return this.http.put(url, {}).pipe(map(data => {
      return true;
    })).pipe(this.errors.handleRetry());
  }

  /** register
  /* register this specific user
  /* use values from registration form
  /* @param {string} email - email
  /* @param {string} password - password
  */
  register(email: string, password: string): Observable<boolean> {
    const url = `${apiSettings.apiHostAuth}/authentication/register`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post(url, {}, { headers: headers }).pipe(map(data => {
      return true;
    })).pipe(this.errors.handleRetry());
  }

  /** login
  /* login of this user
  /* use values from login form
  /* @param {string} email - email
  /* @param {string} password - password
  */
  login(email: string, password: string): Observable<boolean> {
    if (this.currentUser) { // check beforehand if there is already an user
      const prevUrl = this.redirectPreviousUrl.get();
      if (prevUrl && prevUrl !== 'login') {
        this.router.navigateByUrl(`/${prevUrl}`);
        this.redirectPreviousUrl.set(undefined);
      } else {
        this.router.navigate([`${environment.afterLoginGoto}`]);
      }
    }

    const url = `${apiSettings.apiHostAuth}/authentication/login`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post<User>(url, {}, { headers: headers }).pipe(map(user => {
      if (user && user.metisUserAccessToken) {
        this.setCurrentUser(user);
        return true;
      } else {
        return false;
      }
    })).pipe(this.errors.handleRetry());
  }

  /** logout
  /* logout of this user
  /* by setting currentUser to null
  /* current token to null
  /* and empty localstorage
  */
  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem(this.key); // clear token remove user from local storage to log user out
  }

  /** reloadCurrentUser
  /* get latest information from user form zoho
  /* @param {string} email - email
  */
  reloadCurrentUser(email: string): Observable<boolean> {
    const url = `${apiSettings.apiHostAuth}/authentication/update/?userEmailToUpdate=${email}`;
    return this.http.put<User>(url, {}).pipe(map(user => {
      if (user) {
        this.setCurrentUser(user);
        return true;
      } else {
        return false;
      }
    })).pipe(this.errors.handleRetry());
  }

  /** setCurrentUser
  /* store information about current user
  /* in currentUser variable,
  /* in token variable
  /* and in localstorage, to keep user logged in between page refreshes
  /* @param {object} user - user related information
  */
  private setCurrentUser(user: User): void {
    this.currentUser = user;
    this.token = user.metisUserAccessToken.accessToken;
    localStorage.setItem(this.key, JSON.stringify({ user: user, email: user.email, token: this.token}));
  }

  /** getCurrentUser
  /* get information from currently active user
  */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

}
