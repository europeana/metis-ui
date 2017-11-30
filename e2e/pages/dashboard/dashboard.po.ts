import { browser, by, element } from 'protractor';

export class DashboardPage {
  navigateTo() {
    return browser.get('/dashboard');
  }

  getWelcomeMessage() {
    return element(by.css('.metis-welcome-message p')).getText();
  }

  getExecutionsTableRows() {
    return element.all(by.css('.executions-table tr'));
  }

  getExecutionsTableRow(n) {
    const rows = element.all(by.css('.executions-table tr'));
    return rows.get(n);
  }
}
