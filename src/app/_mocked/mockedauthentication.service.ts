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
  userId: '1',
};

export class MockAuthenticationService {
  currentUser = mockUser;

  validatedUser(): boolean {
    return true;
  }

  reloadCurrentUser(): Observable<boolean> {
    return observableOf(true);
  }

  updatePassword(): Observable<boolean> {
    return observableOf(true);
  }

  login(): Observable<boolean> {
    return observableOf(true);
  }

  logout(): void {}

  register(): Observable<boolean> {
    return observableOf(true);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
