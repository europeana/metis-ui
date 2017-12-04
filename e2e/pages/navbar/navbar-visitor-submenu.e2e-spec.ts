import { NavbarPage } from './navbar.po';

describe('Page | Navbar | Visitor | Submenu', () => {
  let page: NavbarPage;

  beforeEach(() => {
    page = new NavbarPage();
    page.navigateTo();
    page.getElementSignIn().click();
  });

  it('should display sub-menu when sign in link is clicked', () => {
    expect(page.getElementSubmenuLogin()).toBeDefined();
    expect(page.getElementSubmenuRegister()).toBeDefined();
  });

  it('should display login page when login link is clicked', () => {
    page.getElementSubmenuLogin().click().then(() => {
      expect(page.getCurrentUrl()).toContain('/login');
    });
  });

  it('should display register page when register link is clicked', () => {
    page.getElementSubmenuRegister().click().then(() => {
      expect(page.getCurrentUrl()).toContain('/register');
    });
  });
});
