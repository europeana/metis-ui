import { browser, by, element, ExpectedConditions } from 'protractor';

describe('Register', () => {

  beforeEach(() => {
    browser.get('/register');
  });

  it('should display register', () => {
    element(by.css('.metis-register-form')).isPresent().then((result) => {
      if ( result ) {
        element(by.id('email')).sendKeys('username');
        element(by.id('password')).sendKeys('password');
        element(by.id('confirm')).sendKeys('password');

        element(by.css('.submit-btn')).click();
        browser.sleep(2000);

        expect(element(by.css('.messages')).isDisplayed()).toBeTruthy();
      }
    });
  });
});
