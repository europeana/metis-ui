import { LoginPage } from './login.po';

describe('Login | Page', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    page.navigateTo();
    page.clearForm();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Sign in to Metis');
  });

  it('submit button should be disabled', () => {
    expect(page.getSubmitButton().isEnabled()).toBe(false);
  });
});
