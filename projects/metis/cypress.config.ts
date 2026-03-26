import { defineConfig } from "cypress";

module.exports = defineConfig({
  env: {
    dataServer: 'http://127.0.0.1:3000',
  },
  e2e: {
    /* // implement node event listeners here
    setupNodeEvents(on, config) {},
    */
    baseUrl: 'http://localhost:4280',
  },
});
