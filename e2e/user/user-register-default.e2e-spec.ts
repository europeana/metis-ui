import { RegisterPage } from '../pages/register/register.po';

describe('User | Register | Default', () => {
  let page: RegisterPage;

  beforeEach(() => {
    page = new RegisterPage();
    page.navigateTo();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Register to Metis');
  });

  describe('submit button should be disabled', () => {
    it('when page loaded', () => {
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

    it('when email valid but passwords do not match', () => {
      page.fillEmail('mirjam.metis@europeana.eu');
      page.fillPassword('secret');
      page.fillConfirm('secretx');
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });
  });

  describe('submit button should be enabled', () => {
    it('when valid email and :wa' +
      'passwords match', () => {
      page.fillEmail('mirjam.metis@europeana.eu');
      page.fillPassword('secret');
      page.fillConfirm('secret');
      expect(page.getSubmitButton().isEnabled()).toBe(true);
    });
  });
});
