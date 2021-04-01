import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

import { AccountRole, User } from '../_models';

export const mockUser: User = {
  accountRole: AccountRole.EUROPEANA_DATA_OFFICER,
  country: 'Netherlands',
  createdDate: 453256554364,
  email: 'mocked@mocked.com',
  firstName: 'mocked',
  lastName: 'test',
  metisUserAccessToken: { accessToken: 'ffsafre' },
  metisUserFlag: true,
  networkMember: true,
  organizationId: '1',
  organizationName: 'organization',
  updatedDate: 546466545364,
  userId: '1'
};

export class MockRedirectPreviousUrl {
  url = '';
  set(url: string): void {
    this.url = url;
  }
  get(): string {
    return this.url;
  }
}

export class MockAuthenticationService {
  currentUser: User | null = mockUser;
  loggedIn = true;
  errorMode = false;
  timerInterval = 1;

  isNumber = (val: string): boolean => {
    return `${parseInt(val)}` === val;
  };

  validatedUser(): boolean {
    return this.loggedIn;
  }

  reloadCurrentUser(): Observable<boolean> {
    if (this.errorMode) {
      return timer(this.timerInterval).pipe(
        switchMap(() => {
          return throwError({
            status: 401,
            error: { errorMessage: 'Mock reloadCurrentUser Error' }
          } as HttpErrorResponse);
        })
      );
    }
    return of(true).pipe(delay(this.timerInterval));
  }

  updatePassword(_: string, __: string): Observable<boolean> {
    if (this.errorMode) {
      return timer(this.timerInterval).pipe(
        switchMap(() => {
          return throwError({
            status: 401,
            error: { errorMessage: 'Mock updatePassword Error' }
          } as HttpErrorResponse);
        })
      );
    }
    return of(true).pipe(delay(this.timerInterval));
  }

  login(_: string, password: string): Observable<boolean> {
    if (this.isNumber(password)) {
      return timer(this.timerInterval).pipe(
        switchMap(() => {
          return throwError({
            status: parseInt(password),
            error: { errorMessage: 'Mock Authentication Error' }
          } as HttpErrorResponse);
        })
      );
    }
    this.loggedIn = password !== 'error';
    return of(this.loggedIn).pipe(delay(this.timerInterval));
  }

  logout(): void {
    this.loggedIn = false;
  }

  register(): Observable<boolean> {
    return of(true).pipe(delay(this.timerInterval));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    if (this.currentUser) {
      return this.currentUser.metisUserAccessToken.accessToken;
    }
    return null;
  }

  getUserByUserId(): Observable<User> {
    return of(mockUser);
  }
}

export class MockAuthenticationServiceErrors extends MockAuthenticationService {
  errorMode = true;
}
