import { browser, by, element } from 'protractor';

export class RegisterPage {
  navigateTo() {
    return browser.get('/register');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  clearForm() {
    this.fillEmail('');
    this.fillPassword('');
    this.fillConfirm('');
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
