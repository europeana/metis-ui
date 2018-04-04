import { AuthenticationService } from '../_services';
import { Observable } from 'rxjs/Observable';

export let currentUser = {
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

  reloadCurrentUser() {
    return Observable.of(true);
  }

  updatePassword() {
    return Observable.of(true);
  }

  login() {
    return Observable.of(true);
  }

}
