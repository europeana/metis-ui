import { LoginPage } from './login.po';

describe('Login | Page', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
    //page.clearForm();
  });

  it('should display form title', () => {
    page.navigateTo();
    expect(page.getFormTitle()).toEqual('Sign in to Metis');
  });
});
