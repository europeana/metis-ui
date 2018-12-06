import { browser, by, element, ExpectedConditions } from 'protractor';
import { environment } from '../../src/environments/environment';

describe('Dataset', () => {
  beforeEach(() => {
    browser.get('/login');

    element(by.id('email')).sendKeys(environment.test.username);
    element(by.id('password')).sendKeys(environment.test.password);
    element(by.tagName('button')).click();
    browser.wait(ExpectedConditions.urlContains('profile'), 5000);
  });

  it('should update trigger a workflow', () => {
    // should be replaced by a mocked call
    /*browser.get('/dataset/new/84');
    browser.wait(ExpectedConditions.urlContains('dataset'), 5000);

    element.all(by.css('.table-btn')).get(0).click();
    browser.sleep(2000);

    expect(element(by.css('.dataset-actionbar')).isPresent()).toBeTruthy();*/
  });

  afterEach(() => {
    browser.executeScript('window.localStorage.clear();');
  });
});
