import { defineConfig } from 'vitest/config'

console.log('>>>> loaded local config...');

export default defineConfig({
  test: {
    name: 'shared testing',
    globals: true,
    environment: 'jsdom',

    setupFiles: ['./default-test-providers.ts'], // Path matches your tsconfig include

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
