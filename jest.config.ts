import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
    '^shared$': __dirname + '/projects/shared/src/public-api.ts'
  },
  moduleDirectories: ['node_modules', '<rootDir>/../projects/shared/lib/public-api.ts'],
  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
