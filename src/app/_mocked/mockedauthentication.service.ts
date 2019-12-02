import { Observable, of as observableOf, throwError } from 'rxjs';

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
  currentUser = mockUser;
  loggedIn = true;

  isNumber = (val: string): boolean => {
    return `${parseInt(val)}` === val;
  };

  validatedUser(): boolean {
    return this.loggedIn;
  }

  reloadCurrentUser(): Observable<boolean> {
    return observableOf(true);
  }

  updatePassword(): Observable<boolean> {
    return observableOf(true);
  }

  login(_: string, password: string): Observable<boolean> {
    if (this.isNumber(password)) {
      return throwError({
        status: parseInt(password),
        error: { errorMessage: 'Mock Authentication Error' }
      });
    }
    this.loggedIn = password !== 'error';
    return observableOf(this.loggedIn);
  }

  logout(): void {
    this.loggedIn = false;
  }

  register(): Observable<boolean> {
    return observableOf(true);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.currentUser.metisUserAccessToken.accessToken;
  }

  getUserByUserId(): Observable<User> {
    return observableOf(mockUser);
  }
}
