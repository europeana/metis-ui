import { NavbarPage } from './navbar.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Navbar | User | Notifications', () => {
  let page: NavbarPage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeEach(() => {
    page = new NavbarPage();
    page.navigateTo();
    page.getElementIconNotifications().click();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display dashboard page when icon notifications is clicked', () => {
    expect(page.getCurrentUrl()).toContain('/dashboard');
  });
});
