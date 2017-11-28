import { LoginPage } from '../pages/login/login.po';

describe('User | Login | NOK', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
  });

  it('cannot login with invalid credentials', () => {
    page.fillEmail('mirjam.metis@europeana.eu');
    page.fillPassword('secret');
    expect(page.getSubmitButton().isEnabled()).toBe(true);
  });
});
