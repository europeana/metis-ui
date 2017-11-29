import { browser, by, element, ExpectedConditions } from 'protractor';

export class ProfilePage {
  navigateTo() {
    return browser.get('/profile');
  }

  getFormTitle() {
    return element(by.css('form h2')).getText();
  }

  getIdValue() {
    return this.getFieldValue('user-id');
  }

  getEmailValue() {
    return this.getFieldValue('email');
  }

  getFirstNameValue() {
    return this.getFieldValue('first-name');
  }

  getLastNameValue() {
    return this.getFieldValue('last-name');
  }

  getOrganizationNameValue() {
    return this.getFieldValue('organization-name');
  }

  getCountryValue() {
    return this.getFieldValue('country');
  }

  getNetworkMemberValue() {
    return this.getFieldValue('network-member');
  }

  getAccountRoleValue() {
    return this.getFieldValue('account-role');
  }

  getPasswordValue() {
    return this.getFieldValue('password');
  }

  getChangePasswordButton() {
    return this.getButton('Change Password');
  }

  getRefreshButton() {
    return this.getButton('Refresh');
  }

  getSubmitButton() {
    return this.getButton('Submit');
  }

  getCancelButton() {
    return this.getButton('Cancel');
  }

  getErrorMessage() {
    return element(by.css('.error-message')).getText();
  }

  fillPassword(value) {
    this.fillField('password', value);
  }

  fillConfirm(value) {
    this.fillField('confirm', value);
  }

  clearFields() {
    this.fillPassword(null);
    this.fillConfirm(null);
  }

  getFlashMessage() {
    return element(by.css('#flashMessages > div > p')).getText();
  }

  private getButton(text) {
    return element(by.buttonText(text));
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
