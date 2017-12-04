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

  it('should display executions table', () => {
    expect(dashboardPage.getExecutionsTableRows().count()).toBeGreaterThan(0);
  });

  it('should display dataset page', () => {
    dashboardPage.getExecutionsTableRows().count().then(rows => {
      const n = Math.floor(Math.random() * rows) + 1;
      dashboardPage.getExecutionsTableRow(n).click().then(() => {
        expect(page.getCurrentUrl()).toContain( `/dataset/detail/${n}` );
        expect(page.getDatasetName()).toBeDefined();
      });
    });
  });
});
