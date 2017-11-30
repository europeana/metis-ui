import { DatasetPage } from './dataset.po';
import { DashboardPage } from '../dashboard/dashboard.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Dataset', () => {
  let page: DatasetPage;
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeAll(() => {
    page = new DatasetPage();
    dashboardPage = new DashboardPage();
    dashboardPage.navigateTo();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display welcome message', () => {
    expect(dashboardPage.getWelcomeMessage()).toContain('Welcome');
  });
});
