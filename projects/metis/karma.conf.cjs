module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-chrome-launcher',
      '@angular-devkit/build-angular/plugins/karma'
    ],
    jasmine: {
      random: false
    },
    client: {
      clearContext: false
    },
    // Force Karma to drop the coverage folder in the workspace root, just like Vitest
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/metis'),
      subdir: '.',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
