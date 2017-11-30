import { RegisterPage } from './register.po';

describe('Register | Page', () => {
  let page: RegisterPage;

  beforeEach(() => {
    page = new RegisterPage();
    //page.clearForm();
  });

  it('should display form title', () => {
    page.navigateTo();
    expect(page.getFormTitle()).toEqual('Register to Metis');
  });
});
