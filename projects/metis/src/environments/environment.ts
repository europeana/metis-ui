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
  paramLoginUnauthorised: 'showModalUnauthorised',
  xsltSplitter: '<!-- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -->',
  links: {
    gotoZoho: 'https://www.zoho.com'
  }
};
