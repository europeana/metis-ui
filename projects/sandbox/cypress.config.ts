import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  expose: {
    dataServer: 'http://127.0.0.1:3000',
  },
  e2e: {
    defaultBrowser: 'chrome',
    baseUrl: 'http://localhost:4280',
    blockHosts: ['*fonts.googleapis.com', '*fonts.gstatic.com'],
    viewportHeight: 768,
    viewportWidth: 1024,
  },
});
