import { LoginPage } from '../pages/login/login.po';

describe('User | Login', () => {
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
