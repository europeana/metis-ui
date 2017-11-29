import { ProfilePage } from './profile.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Profile', () => {
  let profilePage: ProfilePage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeAll(() => {
    profilePage = new ProfilePage();
    profilePage.navigateTo();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display form title', () => {
    expect(profilePage.getFormTitle()).toEqual('User Profile');
  });

  it('should display all form fields', () => {
    expect(profilePage.getIdValue()).toBeDefined();
    expect(profilePage.getEmailValue()).toBeDefined();
    expect(profilePage.getFirstNameValue()).toBeDefined();
    expect(profilePage.getLastNameValue()).toBeDefined();
    expect(profilePage.getOrganizationNameValue()).toBeDefined();
    expect(profilePage.getCountryValue()).toBeDefined();
    expect(profilePage.getNetworkMemberValue()).toBeDefined();
    expect(profilePage.getAccountRoleValue()).toBeDefined();
  });

  it('should display change password and refresh buttons', () => {
    expect(profilePage.getChangePasswordButton()).toBeDefined();
    expect(profilePage.getRefreshButton()).toBeDefined();
  });
});
