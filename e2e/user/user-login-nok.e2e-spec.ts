import { LoginPage } from '../pages/login/login.po';

describe('User | Login | NOK', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
  });

  it('should not be able to login with invalid credentials', () => {
    page.fillEmail('joe.metix@europeana.eu');
    page.fillPassword('secret');
    page.getSubmitButton().click().then(() => {
      expect(page.getErrorMessage()).toContain('Email or password is incorrect');
    });
  });
});
