import { browser, by, element } from 'protractor';

export class LoginPage {
  navigateTo() {
    return browser.get('/login');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  clearForm() {
    this.fillEmail('');
    this.fillPassword('');
  }

  fillEmail(value) {
    this.fillField('email', value);
  }

  fillPassword(value) {
    this.fillField('password', value);
  }

  fillConfirm(value) {
    this.fillField('confirm', value);
  }

  private fillField(name, value) {
    element(by.model(name)).sendKeys(value);
  }
}
