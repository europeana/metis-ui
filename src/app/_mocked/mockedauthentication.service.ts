import {of as observableOf,  Observable } from 'rxjs';
import { AuthenticationService } from '../_services';
import { User, AccountRole } from '../_models';

export const currentUser: User = {
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

export class MockAuthenticationService extends AuthenticationService {

  currentUser = currentUser;

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

  register(): Observable<boolean> {
    return observableOf(true);
  }
}
