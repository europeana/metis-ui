import { LoginPage } from '../pages/login/login.po';

describe('User | Login', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Sign in to Metis');
  });

  describe('submit button should be disabled', () => {
    it('on page load', () => {
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });

    it('when email filled but password empty', () => {
      page.fillEmail('mirjam.metis@europeana.eu');
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });

    it('when password filled but email empty', () => {
      page.fillPassword('secret');
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });

    it('when password filled but email is invalid', () => {
      page.fillEmail('mirjam.metis');
      page.fillPassword('secret');
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });
  });

  describe('submit button should be enabled', () => {
    it('when valid email and password filled', () => {
      page.fillEmail('mirjam.metis@europeana.eu');
      page.fillPassword('secret');
      expect(page.getSubmitButton().isEnabled()).toBe(true);
    });
  });
});
