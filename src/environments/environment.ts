/** environment
/* settings that can be used throughout the entire application
*/

export const environment = {
  production: false,
  passwordStrength: 0,
  intervalStatusShort: 1000,
  intervalStatus: 2500,
  intervalStatusMedium: 5000,
  intervalStatusLong: 60000,
  intervalStatusMax: 60000 * 9.5,
  afterLoginGoto: '/dashboard',
  xsltSplitter: '<!-- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -->',
  links: {
    registerMetis: 'http://pro-beta.europeana.eu/page/register-to-metis',
    gotoZoho: 'https://www.zoho.com',
    updateProfileMain: 'content@europeana.eu'
  },
  test: {
    username: 'username',
    password: 'password'
  }
};
