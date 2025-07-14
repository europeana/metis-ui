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

import { getEnvVar } from 'shared';

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

type PAQ = Array<Array<string>>;

export type NavType =
  | 'external'
  | 'form'
  | 'link'
  | 'top-nav'
  | 'pop-out-link'
  | 'tier-stats-link'
  | 'published-records';

export const matomoSettings = {
  matomoTrackerUrl: `${matomoHost}`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(`${matomoSiteId}`),
  getPAQ: (): PAQ => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)['_paq'] as PAQ;
  }
};
