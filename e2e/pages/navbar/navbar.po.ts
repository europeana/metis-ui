import { browser, by, element, ExpectedConditions } from 'protractor';

export class NavbarPage {
  navigateTo() {
    return browser.get('/');
  }

  getCompanyLogo() {
    return element(by.css('.logo'));
  }

  getElementSignIn() {
    return element(by.css('a.signup'));
  }

  getElementIconUser() {
    return element(by.css('.svg-icon-loggedin-user'));
  }
}
