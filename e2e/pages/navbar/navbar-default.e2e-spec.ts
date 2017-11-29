import { NavbarPage } from './navbar.po';

describe('Page | Navbar | Default', () => {
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
});
