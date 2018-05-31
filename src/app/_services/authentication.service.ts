import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';

import { User } from '../_models';

@Injectable()
export class AuthenticationService {

  private readonly key = 'currentUser';
  private token: string;
  public currentUser = null;

  constructor(private http: HttpClient) {
    // set currentUser and token if already saved in local storage
    const value = localStorage.getItem(this.key);
    if (value) {
      const hash = JSON.parse(value);
      this.currentUser = hash.user;
      this.token = hash.token;
    }
  }

  /** validatedUser
  /* check if user is validated/allowd
  */
  validatedUser(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  /** getToken
  /* get token from user that is already logged in
  */  
  getToken(): string {
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
  updatePassword(password: string) {
    const url = `${apiSettings.apiHostAuth}/authentication/update/password?newPassword=${password}`;
    return this.http.put(url, JSON.stringify('{}')).pipe(map(data => {
      return true;
    }));
  }

  /** register
  /* register this specific user
  /* use values from registration form
  /* @param {string} email - email
  /* @param {string} password - password
  */ 
  register(email: string, password: string) {
    const url = `${apiSettings.apiHostAuth}/authentication/register`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post(url, JSON.stringify('{}'), { headers: headers }).pipe(map(data => {
      return true;
    }));

  }

  /** login
  /* login of this user
  /* use values from login form
  /* @param {string} email - email
  /* @param {string} password - password
  */ 
  login(email: string, password: string) {
    const url = `${apiSettings.apiHostAuth}/authentication/login`;
    const headers = new HttpHeaders({Authorization: 'Basic ' + btoa(email + ':' + password)});
    return this.http.post(url, JSON.stringify('{}'), { headers: headers }).pipe(map(data => {
      const user = <User>data;
      if (user && user.metisUserAccessToken) {
        this.setCurrentUser(user);
        return true;
      } else {
        return false;
      }
    }));
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
  reloadCurrentUser(email: string) {
    const url = `${apiSettings.apiHostAuth}/authentication/update/?userEmailToUpdate=${email}`;    
    return this.http.put(url, JSON.stringify('{}')).pipe(map(data => {
      const user = <User>data;
      if (user) {
        this.setCurrentUser(user);
        return true;
      } else {
        return false;
      }
    }));
  }

  /** setCurrentUser
  /* store information about current user
  /* in currentUser variable, 
  /* in token variable
  /* and in localstorage, to keep user logged in between page refreshes
  /* @param {object} user - user related information
  */ 
  private setCurrentUser(user: User) {
    this.currentUser = user;
    this.token = user.metisUserAccessToken.accessToken;
    localStorage.setItem(this.key, JSON.stringify({ user: user, email: user.email, token: this.token}));
  }

  /** getCurrentUser
  /* get information from currently active user
  */ 
  getCurrentUser() {
    return this.currentUser;
  }

}
