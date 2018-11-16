import { browser, by, element, ExpectedConditions } from 'protractor';
import { environment } from '../../src/environments/environment';

describe('Register', () => {

  beforeEach(() => {
    browser.get('/register');
  });

  it('should display register', () => {
    element(by.css('.metis-register-form')).isPresent().then((result) => {
      if ( result ) {
        element(by.id('email')).sendKeys(environment.test.username);
        element(by.id('password')).sendKeys(environment.test.password);
        element(by.id('confirm')).sendKeys(environment.test.password);

        element(by.css('.submit-btn')).click();
        browser.sleep(2000);

        expect(element(by.css('.messages')).isDisplayed()).toBeTruthy();
      }
    });
  });
});
