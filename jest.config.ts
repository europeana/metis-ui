 import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';


export default {
  ...createCjsPreset(),
//  roots: ['<rootDir>'],

  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
    '^shared$': '<rootDir>./../../shared/src/public-api.ts',
//    '^keycloak-js$': '<rootDir>/../../../node_modules/keycloak-js/lib/keycloak.d.ts'
//    '^keycloak-js$': '<rootDir>/../../../projects/keycloak-js/lib/keycloak.d.ts'
//    '^keycloak-js$': '/home/andy/git/metis-ui/projects/keycloak-js/lib/keycloak.d.ts'
//    '^keycloak-js$': '<rootDir>./../../keycloak-js/lib/keycloak.d.ts'
    '^keycloak-js$': '<rootDir>./keycloak-js/lib/keycloak.d.ts'
  },

  moduleDirectories: ['node_modules', '<rootDir>./../../shared/src/lib/public-api.ts'

, '<rootDir>./keycloak-js/lib/keycloak.d.ts'
//, '<rootDir>./../../keycloak-js/lib/keycloak.d.ts'
],

//  moduleDirectories: ['node_modules', '<rootDir>/../../../projects/keycloak_local/keycloak.d.ts'],

  // regexp - not a glob pattern
  // 'xxxxxxxxx' breaks it
  /*
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  */

  //  testMatch: [ "**/__tests__/**/*.?([mc])[jt]s?(x)", "**/?(*.)+(spec|test).?([mc])[jt]s?(x)" ],

  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
