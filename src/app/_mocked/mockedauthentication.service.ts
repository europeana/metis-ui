import { Observable, of as observableOf } from 'rxjs';

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

export class MockAuthenticationService {
  currentUser = mockUser;
  loggedIn = true;

  validatedUser(): boolean {
    return this.loggedIn;
  }

  reloadCurrentUser(): Observable<boolean> {
    return observableOf(true);
  }

  updatePassword(): Observable<boolean> {
    return observableOf(true);
  }

  login(email: string, password: string): Observable<boolean> {
    console.log(`mock login: ${email}/${password}`);
    this.loggedIn = true;
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
