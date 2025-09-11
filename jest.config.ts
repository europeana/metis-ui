import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),

  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
//    '^keycloak-js$': '<rootDir>./keycloak-js/lib/keycloak.d.ts',
    '^shared$': '<rootDir>./../../shared/src/public-api.ts',
  },


  moduleDirectories: [
      'node_modules',
      '<rootDir>./../../shared/src/lib/public-api.ts',
      '<rootDir>./keycloak-js/lib/keycloak.d.ts'
  ],

  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
