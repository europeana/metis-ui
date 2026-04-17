import { defineConfig } from "cypress";

module.exports = defineConfig({
  env: {
    dataServer: 'http://127.0.0.1:3000',
  },
  e2e: {
    baseUrl: 'http://localhost:4280',
    blockHosts: ['*fonts.googleapis.com', '*fonts.gstatic.com'],
    viewportHeight: 768,
    viewportWidth: 1024
  }
});
