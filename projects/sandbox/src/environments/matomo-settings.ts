import { getEnvVar } from './environment-utils';

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

type PAQ = Array<Array<string>>;

export const matomoSettings = {
  matomoTrackerUrl: `${matomoHost}`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(`${matomoSiteId}`),
  getPAQ: (): PAQ => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)['_paq'] as PAQ;
  }
};
