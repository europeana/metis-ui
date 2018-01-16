// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  envName: 'development',
  passwordStrength: 0,
  apiLogin: 'authentication/login',
  apiRegister: 'authentication/register',
  apiUsers: 'authentication/users',
  apiProfile: 'authentication/update',
  apiUpdatePassword: 'authentication/update/password',
  apiDatasets: 'datasets',
  emails: {
    profile: 'content@europeana.eu'
  },
  test: {
    username: 'test.metis@europeana.eu',
    password: '123'
  },
  afterLoginGoto: '/profile',
  links: {
    registerMetis: 'http://pro-beta.europeana.eu/page/register-to-metis',
    gotoZoho: 'https://www.zoho.com'
  }
};
