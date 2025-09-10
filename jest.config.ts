import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';


//console.log('__dirname = ' + __dirname + ', ' + rootDir);

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
//    '^shared$': '<rootDir>./../../../projects/shared/src/public-api.ts'
    '^shared$': __dirname + '/projects/shared/src/public-api.ts'
    , '^keycloak-js$': __dirname +  '/node_modules/keycloak-js/lib/keycloak.d.ts'
  },

  //moduleDirectories: ['node_modules', '<rootDir>/../projects/shared/lib/public-api.ts'],
  moduleDirectories: ['node_modules', __dirname + '/projects/shared/src/lib/public-api.ts'],
  //moduleDirectories: ['node_modules',  '<rootDir>./../../../projects/shared/src/lib/public-api.ts'],
  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
