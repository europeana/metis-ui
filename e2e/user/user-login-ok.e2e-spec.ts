import { LoginPage } from '../pages/login/login.po';

import { environment } from '../../src/environments/environment';

describe('User | Login | OK', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
  });

  afterAll(() => {
    page.logOut();
  });

  it('can login with valid credentials', () => {
    page.fillEmail(environment.test.username);
    page.fillPassword(environment.test.password);
    page.getSubmitButton().click().then(() => {
      expect(page.getCurrentUrl()).toContain(environment.afterLoginGoto);
    });
  });
});
