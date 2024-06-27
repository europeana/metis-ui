/*
  matomoSettings

  SPA "page" tracking uses methods:
   - setCustomUr
   - setDocumentTitle
   - trackPageView

  (see here):
  - "Solution 2: Embedding the Tracking Code manually"
    https://developer.matomo.org/guides/spa-tracking

  Note: the custom TitleStrategy approach is invalid here  because the
  updateTitle() isn't invoked for queryParams or router-shared components,
  so this can't used:
   - https://medium.com/geekculture/standalone-components-with-custom-title-strategy-in-angular-14-aec71a23bcd8
*/

import { getEnvVar } from './environment-utils';

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

type PAQ = Array<Array<string>>;

export type NavType = 'form' | 'top-nav' | 'link';

export const matomoSettings = {
  matomoTrackerUrl: `${matomoHost}`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(`${matomoSiteId}`),
  getPAQ: (): PAQ => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)['_paq'] as PAQ;
  },
  internalNavClick: (navTypes: Array<NavType>): void => {
    const _paq = matomoSettings.getPAQ();
    if (_paq) {
      _paq.push(['trackEvent', 'navigation', 'click'].concat(navTypes));
    }
  },
  urlChanged: (path: string, title: string): void => {
    const _paq = matomoSettings.getPAQ();
    if (_paq) {
      _paq.push(['setCustomUrl', path]);
      _paq.push(['setDocumentTitle', title]);
      _paq.push(['trackPageView']);
    }
  }

  /*
  trackLink( url, linkType )  // links or download

  https://developer.matomo.org/api-reference/tracking-javascript

  trackNav: (url: string, mechanism: 'link-name' | 'redirect' | 'browser back?') => {
    console.log('trackNav(url: ' + url + ', mechanism: ' + mechanism + ')');
  },
  */

  /*
  trackEvent(category, action, [name], [value])

  https://developer.matomo.org/api-reference/tracking-javascript
  */
};
