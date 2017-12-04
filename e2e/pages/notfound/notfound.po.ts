import { browser, by, element } from 'protractor';

export class NotfoundPage {
  navigateTo() {
    return browser.get('/this-page-does-not-exist');
  }

  getErrorMessage() {
    return element(by.css('h2')).getText();
  }
}
