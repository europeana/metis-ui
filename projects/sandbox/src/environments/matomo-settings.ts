const getEnvVar = (key: string): string | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (window as any).__env;
  return env ? env[key] : null;
};

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

type PAQ = Array<Array<string>>;

export const matomoSettings = {
  matomoTrackerUrl: `${matomoHost}/matomo.php`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(`${matomoSiteId}`),
  getPAQ: (): PAQ => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)['_paq'] as PAQ;
  }
};
