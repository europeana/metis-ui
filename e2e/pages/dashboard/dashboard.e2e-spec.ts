import { DashboardPage } from './dashboard.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Profile', () => {
  let page: DashboardPage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeAll(() => {
    page = new DashboardPage();
    page.navigateTo();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display welcome message', () => {
    expect(page.getWelcomeMessage()).toContain('Welcome');
  });
});
