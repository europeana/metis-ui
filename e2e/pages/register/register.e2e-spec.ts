import { RegisterPage } from './register.po';

describe('Register | Page', () => {
  const page = new RegisterPage();

  page.navigateTo();

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Register to Metis');
  });

  it('should be an empty email field present', () => {
    expect(page.getEmailValue()).toEqual(undefined);
  });

  it('should be an empty password field present', () => {
    expect(page.getPasswordValue()).toEqual(undefined);
  });

  it('should be an empty confirm field present', () => {
    expect(page.getConfirmValue()).toEqual(undefined);
  });

  it('should be a submit button present', () => {
    expect(page.getSubmitButton().isPresent()).toBe(true);
  });

  it('submit button should be disabled', () => {
    expect(page.getSubmitButton().isEnabled()).toBe(false);
  });
});
