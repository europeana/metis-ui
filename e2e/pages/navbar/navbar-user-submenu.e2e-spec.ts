import { NavbarPage } from './navbar.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Navbar | User | Submenu', () => {
  let page: NavbarPage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeEach(() => {
    page = new NavbarPage();
    page.navigateTo();
    page.getElementIconUser().click();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display sub-menu when icon user is clicked', () => {
    expect(page.getElementSubmenuProfile()).toBeDefined();
    expect(page.getElementSubmenuLogout()).toBeDefined();
  });

  it('should display profile page when profile link is clicked', () => {
    page.getElementSubmenuProfile().click().then(() => {
      expect(page.getCurrentUrl()).toContain('/profile');
    });
  });

  it('should display home page when logout link is clicked', () => {
    page.getElementSubmenuLogout().click().then(() => {
      expect(page.getCurrentUrl()).toContain('/home');
    });
  });
});
