import { defineConfig } from 'vitest/config'

console.log('load root conf...yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Glob patterns to find sub-packages with their own configs
    projects: ['projects/*/vitest.config.ts'],
    // Global options (e.g., coverage or reporters) go here
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
