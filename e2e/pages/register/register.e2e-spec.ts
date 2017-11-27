import { RegisterPage } from './register.po';

describe('Register | Page', () => {
  let page: RegisterPage;

  beforeEach(() => {
    page = new RegisterPage();
    page.navigateTo();
    page.clearForm();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Register to Metis');
  });

  it('submit button should be disabled', () => {
    expect(page.getSubmitButton().isEnabled()).toBe(false);
  });
});
