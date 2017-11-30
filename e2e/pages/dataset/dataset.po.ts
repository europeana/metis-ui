import { browser, by, element } from 'protractor';

export class DatasetPage {
  getDatasetName() {
    return element(by.css('.dataset-name')).getText();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }
}
