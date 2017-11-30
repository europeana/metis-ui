import { NavbarPage } from './navbar.po';
import { LoginPage, UserRole } from '../login/login.po';

describe('Page | Navbar | User | Default', () => {
  let page: NavbarPage;
  let loginPage: LoginPage;

  beforeAll(() => {
    loginPage = new LoginPage();
    loginPage.loginAs(UserRole.PROVIDER_VIEWER);
  });

  beforeAll(() => {
    page = new NavbarPage();
    page.navigateTo();
  });

  afterAll(() => {
    loginPage.logOut();
  });

  it('should display company logo', () => {
    expect(page.getCompanyLogo()).toBeDefined();
  });

  it('should display user icon link', () => {
    expect(page.getElementIconUser()).toBeDefined();
  });

  it('should display search', () => {
    expect(page.getElementSearch()).toBeDefined();
  });
});
