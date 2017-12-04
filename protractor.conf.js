// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',

    // https://sites.google.com/a/chromium.org/chromedriver/capabilities
    chromeOptions: {
     args: [ "--headless", "--disable-gpu", "--window-size=1920,1080" ]
    }

  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    // IMPORTANT: Need to maximize browser window to ensure that all page elements are visible,
    // otherwise certain tests may fail unexpectantly. Does not work in headless chrome.
    browser.manage().window().maximize();
  }
};
