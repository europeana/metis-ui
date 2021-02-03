import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import { environment } from '../../environments/environment';
import { KeyedCache } from '../_helpers';
import { User } from '../_models';

import { ErrorService } from './error.service';
import { RedirectPreviousUrl } from './redirect-previous-url.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly key = 'currentUser';
  private token: string | null;
  public currentUser: User | null = null;

  userCache = new KeyedCache((key) => this.requestUserByUserId(key));

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly errors: ErrorService,
    private readonly redirectPreviousUrl: RedirectPreviousUrl
  ) {
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
    if (!s) {
      return null;
    }
    const h = JSON.parse(s);
    return h.token;
  }

  /** updatePassword
  /* update password for this user
  /* @param {string} password - password
  */
  updatePassword(newPassword: string, oldPassword: string): Observable<boolean> {
    const url = `${apiSettings.apiHostAuth}/authentication/update/password`;
    return this.http
      .put(url, { newPassword, oldPassword })
      .pipe(
        map(() => {
          return true;
        })
      )
      .pipe(this.errors.handleRetry());
  }

  /** register
  /* register this specific user
  /* use values from registration form
  /* @param {string} email - email
  /* @param {string} password - password
  */
  register(email: string, password: string): Observable<boolean> {
    const url = `${apiSettings.apiHostAuth}/authentication/register`;
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa([email, password].join(':'))}`
    });
    return this.http
      .post(url, {}, { headers })
      .pipe(
        map(() => {
          return true;
        })
      )
      .pipe(this.errors.handleRetry());
  }

  /** login
  /* login of this user
  /* use values from login form
  /* @param {string} email - email
  /* @param {string} password - password
  */
  login(email: string, password: string): Observable<boolean> {
    if (this.currentUser) {
      // check beforehand if there is already an user
      const prevUrl = this.redirectPreviousUrl.get();
      if (prevUrl && prevUrl !== 'login') {
        this.router.navigateByUrl(`/${prevUrl}`);
        this.redirectPreviousUrl.set(undefined);
      } else {
        this.router.navigate([environment.afterLoginGoto]);
      }
      return of(true);
    }

    const url = `${apiSettings.apiHostAuth}/authentication/login`;
    const headers = new HttpHeaders({
      Authorization: `Basic ${btoa([email, password].join(':'))}`
    });
    return this.http
      .post<User>(url, {}, { headers })
      .pipe(
        map((user) => {
          if (user && user.metisUserAccessToken) {
            this.setCurrentUser(user);
            return true;
          } else {
            return false;
          }
        })
      )
      .pipe(this.errors.handleRetry());
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
    const url = `${apiSettings.apiHostAuth}/authentication/update`;
    return this.http
      .put<User>(url, { email })
      .pipe(
        map((user) => {
          if (user) {
            this.setCurrentUser(user);
            return true;
          } else {
            return false;
          }
        })
      )
      .pipe(this.errors.handleRetry());
  }

  /** setCurrentUser
  /* store information about current user
  /* in currentUser variable,
  /* in token variable
  /* and in localstorage, to keep user logged in between page refreshes
  /* @param {object} user - user related information
  */
  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.token = user.metisUserAccessToken.accessToken;
    localStorage.setItem(this.key, JSON.stringify({ user, email: user.email, token: this.token }));
  }

  /** getCurrentUser
  /* get information from currently active user
  */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  requestUserByUserId(userId: string): Observable<User> {
    const url = `${apiSettings.apiHostAuth}/authentication/user_by_user_id`;
    return this.http
      .post<User>(url, { userId })
      .pipe(this.errors.handleRetry());
  }

  getUserByUserId(userId: string): Observable<User> {
    return this.userCache.get(userId);
  }
}
