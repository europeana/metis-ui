import { browser, by, element } from 'protractor';

export class HomePage {
  navigateTo() {
    return browser.get('/');
  }

  getBannerHeading() {
    return element(by.css('h2')).getText();
  }

  getBannerText() {
    return element(by.css('.banner-info')).getText();
  }

  getBannerLinkText() {
    return element(by.css('.banner-link')).getText();
  }
}
