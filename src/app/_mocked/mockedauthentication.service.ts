import {of as observableOf,  Observable } from 'rxjs';
import { AuthenticationService } from '../_services';

export const currentUser = {
  accountRole: 'user',
  country: 'Netherlands',
  createdDate: '',
  email: 'mocked@mocked.com',
  firstName: 'mocked',
  lastName: 'test',
  metisUserAccessToken: {},
  metisUserFlag: true,
  networkMember: true,
  organizationId: 1,
  organizationName: 'organization',
  updatedDate: '',
  userId: 1
};

export class MockAuthenticationService extends AuthenticationService {

  currentUser = currentUser;

  validatedUser() {
    return true;
  }

  reloadCurrentUser() {
    return observableOf(true);
  }

  updatePassword() {
    return observableOf(true);
  }

  login() {
    return observableOf(true);
  }

  register() {
    return observableOf(true);
  }
}
