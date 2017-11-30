import { browser, by, element, ExpectedConditions } from 'protractor';

export class NavbarPage {
  navigateTo() {
    return browser.get('/');
  }

  getCompanyLogo() {
    return element(by.css('.logo'));
  }

  getElementSearch() {
    return element(by.css('form.search-multiterm'));
  }

  getElementSignIn() {
    return element(by.css('a.signup'));
  }

  getElementSubmenuLogin() {
    return element(by.linkText('Login'));
  }

  getElementSubmenuRegister() {
    return element(by.linkText('Register'));
  }

  getElementSubmenuProfile() {
    return element(by.linkText('My Profile'));
  }

  getElementSubmenuLogout() {
    return element(by.linkText('Log out'));
  }

  getElementIconUser() {
    return element(by.css('.svg-icon-loggedin-user'));
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }
}
