import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getWelcomeMessage() {
    return element(by.css('h2')).getText();
  }
}
