import { matomoSettings } from './matomo-settings';
import { getEnvVar } from './environment-utils';

/**
 * callbackMatomo
 *
 * handle cookie permission
 *
 * @param { boolean: consent }
 **/

const callbackMatomo = (consent: boolean): void => {
  const _paq = matomoSettings.getPAQ();
  if (_paq) {
    if (consent == true) {
      _paq.push(['setCookieConsentGiven']);
    } else {
      _paq.push(['forgetCookieConsentGiven']);
    }
  }
};

export const cookieConsentConfig = {
  privacyPolicyUrl: getEnvVar('privacyPolicyUrl') as string,
  services: [
    {
      name: 'matomo',
      label: 'matomo tracker',
      description: 'Collects anonymous statistics on how visitors interact with the website.',
      purposes: ['usage tracking', 'tracking that'],
      callback: callbackMatomo,
      cookies: [/_pk_id\./, /_pk_ses\./]
    }
  ]
};
