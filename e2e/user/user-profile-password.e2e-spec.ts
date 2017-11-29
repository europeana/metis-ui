import { ProfilePage } from '../pages/profile/profile.po';
import { LoginPage, UserRole } from '../pages/login/login.po';

import { environment } from '../../src/environments/environment';

describe('User | Profile', () => {
  let page: ProfilePage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeAll(() => {
    page = new ProfilePage();
    page.navigateTo();
    page.getChangePasswordButton().click();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display form title', () => {
    expect(page.getFormTitle()).toEqual('Change Password');
  });

  it('should display cancel and submit buttons', () => {
      expect(page.getCancelButton().isPresent()).toBe(true);
      expect(page.getSubmitButton().isPresent()).toBe(true);
  });

  describe('submit button should be disabled', () => {
    it('on page load', () => {
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });

    it('when password filled but confirm empty', () => {
      page.fillPassword(environment.test.password);
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });

    it('when password filled but confirm does not match', () => {
      page.fillConfirm('x' + environment.test.password);
      expect(page.getSubmitButton().isEnabled()).toBe(false);
    });
  });

  describe('submit button should be enabled', () => {
    it('when password and confirm match', () => {
      page.clearFields();
      page.fillPassword(environment.test.password);
      page.fillConfirm(environment.test.password);
      expect(page.getSubmitButton().isEnabled()).toBe(true);
    });
  });

  describe('submit new password', () => {
    it('password changed successfully', () => {
      page.clearFields();
      page.fillPassword(environment.test.password);
      page.fillConfirm(environment.test.password);
      page.getSubmitButton().click();
      expect(page.getFlashMessage()).toEqual('Update password successful!')
    });
  });
});
