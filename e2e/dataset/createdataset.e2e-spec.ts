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

  it('should create new dataset', () => {
    browser.get('/dataset/new');
    browser.wait(ExpectedConditions.urlContains('dataset'), 5000);
    element(by.id('dataset-name')).sendKeys('AngularTestCaseDatasetname');
    element(by.id('provider')).sendKeys('AngularTestCaseProvider');

    element(by.css('.submit')).click(); // should be replaced by a mocked call
    browser.sleep(2000);

    expect(element(by.css('.success-message')).isPresent()).toBeTruthy();
  });

  it('should update a dataset', () => {
    // should be replaced by a mocked call
    /*browser.get('/dataset/new/84');
    browser.wait(ExpectedConditions.urlContains('dataset'), 5000);
    element(by.id('dataset-name')).sendKeys('AngularTestCaseDatasetname');
    element(by.id('provider')).sendKeys('AngularTestCaseProvider');

    element(by.css('.submit')).click();
    browser.sleep(2000);

    expect(element(by.css('.success-message')).isPresent()).toBeTruthy();*/
  });

  afterEach(() => {
    browser.executeScript('window.localStorage.clear();');
  });
});
