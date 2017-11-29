import { browser, by, element, ExpectedConditions } from 'protractor';
import { environment } from '../../../src/environments/environment';

export enum UserRole {
  METIS_ADMIN = 1,
  EUROPEANA_DATA_OFFICER,
  PROVIDER_VIEWER
}

export class LoginPage {
  navigateTo() {
    return browser.get('/login');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  getEmailValue() {
    this.getFieldValue('email');
  }

  getPasswordValue() {
    this.getFieldValue('password');
  }

  getSubmitButton() {
    return element(by.css('form .login-btn'));
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }

  getErrorMessage() {
    return element(by.css('.error-message')).getText();
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

  loginAs(role: UserRole) {
    this.logOut();
    this.navigateTo();
    this.fillEmail(environment.test.username);
    this.fillPassword(environment.test.password);
    this.getSubmitButton().click();
    browser.wait(ExpectedConditions.urlContains(environment.afterLoginGoto), 5000);
  }

  logOut() {
    return browser.get('/logout');
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
