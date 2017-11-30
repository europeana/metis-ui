import { browser, by, element } from 'protractor';

export class DatasetPage {
  getWelcomeMessage() {
    return element(by.css('.metis-welcome-message p')).getText();
  }
}
