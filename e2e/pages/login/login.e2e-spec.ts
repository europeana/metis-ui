import { LoginPage } from './login.po';

describe('Page | Login', () => {
  let page: LoginPage;

  beforeAll(() => {
    page = new LoginPage();
    page.navigateTo();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Sign in to Metis');
  });

  it('should be an empty email field present', () => {
    expect(page.getEmailValue()).toEqual(undefined);
  });

  it('should be an empty password field present', () => {
    expect(page.getPasswordValue()).toEqual(undefined);
  });

  it('should be a submit button present', () => {
    expect(page.getSubmitButton().isPresent()).toBe(true);
  });

  it('submit button should be disabled', () => {
    expect(page.getSubmitButton().isEnabled()).toBe(false);
  });
});
