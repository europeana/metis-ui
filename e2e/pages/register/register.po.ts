import { browser, by, element } from 'protractor';

export class RegisterPage {
  navigateTo() {
    return browser.get('/register');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  getSubmitButton() {
    return element(by.css('form .submit-btn'));
  }

  getEmailValue() {
    this.getFieldValue('email');
  }

  getConfirmValue() {
    this.getFieldValue('confirm');
  }

  getPasswordValue() {
    this.getFieldValue('password');
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

  private getFieldValue(name) {
    return element(by.id(name)).getText();
  }

  private fillField(name, value) {
    const el = element(by.id(name));
    if (value && value.length) {
      el.sendKeys(value);
    } else {
      el.clear();
    }
  }
}
