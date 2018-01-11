import { browser, by, element, ExpectedConditions } from 'protractor';
import { environment } from '../../src/environments/environment';

describe('Profile', () => {

  beforeEach(() => {
    browser.get('/profile');
  });

  it('should display profile', () => {
    
    element(by.css('.metis-profile-form')).isPresent().then(function(result) {
      if ( result ) {
    
        element(by.id('refresh-btn')).click();
        browser.sleep(2000);
        
        expect(element(by.css('.messages')).isDisplayed()).toBeTruthy();

      } else {

        element(by.id('email')).sendKeys(environment.test.username);
        element(by.id('password')).sendKeys(environment.test.password);        
        element(by.tagName('button')).click();
        browser.wait(ExpectedConditions.urlContains('profile'), 5000);

        element(by.id('refresh-btn')).click(); 
        browser.sleep(2000);

        expect(element(by.css('.messages')).isDisplayed()).toBeTruthy();

      }
    });
  });

  afterEach(function() {
    browser.executeScript('window.localStorage.clear();');
  });

});