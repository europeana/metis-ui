import { matomoSettings } from './matomo-settings';

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
      _paq.push(['rememberCookieConsentGiven']);
    } else {
      _paq.push(['forgetCookieConsentGiven']);
    }
  }
};

export const cookieConsentConfig = {
  services: [
    {
      name: 'matomo',
      label: 'matomo tracker',
      description: 'Collects anonymous statistics on how visitors interact with the website.',
      purposes: ['usage tracking'],
      callback: callbackMatomo,
      cookies: [/_pk_id\./, /_pk_ses\./]
    },
    {
      name: 'Consent',
      label: 'Consent',
      description:
        'Remembers what consent you have given for the use of services on this web application.',
      required: true
    }
  ]
};
