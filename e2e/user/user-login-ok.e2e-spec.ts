import { LoginPage } from '../pages/login/login.po';

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
    page.fillEmail('valentine.metis@europeana.eu');
    page.fillPassword('123');
    page.getSubmitButton().click().then(() => {
      expect(page.getCurrentUrl()).toContain('/profile');
      page.logOut();
    });
  });
});
