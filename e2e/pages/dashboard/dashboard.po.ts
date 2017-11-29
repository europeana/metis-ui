import { browser, by, element } from 'protractor';

export class DashboardPage {
  navigateTo() {
    return browser.get('/dashboard');
  }

  getWelcomeMessage() {
    return element(by.css('.metis-welcome-message p')).getText();
  }
}
