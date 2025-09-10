import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';


//console.log('__dirname = ' + __dirname + ', ' + rootDir);

let fnm = __filename.match(/(.*\/)(.*)$/);
let xxx = fnm ? fnm[1].slice(0, -1) : '';

console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   ' + xxx);

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./../../../setup-jest.ts'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
    '^shared$': xxx + '/projects/shared/src/public-api.ts',
    '^keycloak-js$': xxx + '/node_modules/keycloak-js/lib/keycloak.d.ts'
//    '^shared$': process.cwd() + '/projects/shared/src/public-api.ts',
//    '^keycloak-js$': process.cwd() + '/node_modules/keycloak-js/lib/keycloak.d.ts'
    //'^shared$': '<rootDir>./../../../projects/shared/src/public-api.ts',
    //'^keycloak-js$': '<rootDir>./../../../node_modules/keycloak-js/lib/keycloak.d.ts'
  },

  //moduleDirectories: ['node_modules', '<rootDir>/../projects/shared/lib/public-api.ts'],
  moduleDirectories: ['node_modules', xxx + '/projects/shared/src/lib/public-api.ts'],
  //moduleDirectories: ['node_modules',  '<rootDir>./../../../projects/shared/src/lib/public-api.ts'],
  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|keycloak-js))'],
  coverageReporters: ['lcov', 'html'],
  testEnvironment: './../../../FixJsDomEnvironment.ts',
} satisfies Config;
