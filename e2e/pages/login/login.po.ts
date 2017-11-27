import { browser, by, element } from 'protractor';

export class LoginPage {
  navigateTo() {
    return browser.get('/login');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  getSubmitButton() {
    return element(by.css('form .login-btn'));
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

  private fillField(name, value) {
    const el = element(by.id(name));
    if (value && value.length) {
      el.sendKeys(value);
    } else {
      el.clear();
    }
  }
}
