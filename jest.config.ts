 import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';


export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
    '^shared$': '<rootDir>./../../../projects/shared/src/public-api.ts',
//    '^keycloak-js$': '<rootDir>/../../../node_modules/keycloak-js/lib/keycloak.d.ts'
//    '^keycloak-js$': '<rootDir>/../../../projects/keycloak-js/lib/keycloak.d.ts'
//    '^keycloak-js$': '/home/andy/git/metis-ui/projects/keycloak-js/lib/keycloak.d.ts'
    '^keycloak-js$': '<rootDir>./../../../projects/keycloak-js/lib/keycloak.d.ts'
  },

  moduleDirectories: ['node_modules', '<rootDir>./../../../projects/shared/src/lib/public-api.ts'

, '<rootDir>./../../../projects/keycloak-js/lib/keycloak.d.ts'
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


  //testPathIgnorePatterns: [
  //],

  // keycloak paths do not work on github
  //testPathIgnorePatterns: [


//    'app\\.component',
//    'sandbox(.*)navigation',
//    'user\\-data',
//    'problem\\-viewer',

  //],
  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
