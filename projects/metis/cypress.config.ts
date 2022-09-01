import { defineConfig } from 'cypress'

export default defineConfig({
  blockHosts: ['*fonts.googleapis.com', '*fonts.gstatic.com'],
  screenshotsFolder: 'tmp/cypress-screenshots/',
  video: false,
  videosFolder: 'tmp/cypress-videos/',
  viewportHeight: 768,
  viewportWidth: 1024,
  env: {
    dataServer: 'http://127.0.0.1:3000',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4280',
    excludeSpecPattern: ['tsconfig.json'],
  },
})
