import { NavbarPage } from './navbar.po';

describe('Page | Navbar | Visitor | Default', () => {
  let page: NavbarPage;

  beforeAll(() => {
    page = new NavbarPage();
    page.navigateTo();
  });

  it('should display company logo', () => {
    expect(page.getCompanyLogo()).toBeDefined();
  });

  it('should display sign in link', () => {
    expect(page.getElementSignIn().getText()).toEqual('SIGN IN');
  });

  it('should display sub-menu when sign in link is clicked', () => {
    page.getElementSignIn().click();
    expect(page.getElementSubmenuLogin()).toBeDefined();
    expect(page.getElementSubmenuRegister()).toBeDefined();
  });
});
