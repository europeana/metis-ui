import { EnvironmentProviders, Provider } from '@angular/core';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  provideKeycloak,
  ProvideKeycloakOptions,
  UserActivityService,
  withAutoRefreshToken
} from 'keycloak-angular';

import { apiSettings } from '../../environments/apisettings';
import { provideKeycloakMock } from './';

const includeTokenCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^((?!metis-maintenance).)*$/
});

export const provideKeycloakAngular = (): Provider | EnvironmentProviders => {
  const url = apiSettings.apiHostAuth;
  const realm = 'europeana';
  const clientId = 'metis-ui';

  const config = {
    config: {
      realm: realm,
      url: url,
      clientId: clientId
    },
    initOptions: {
      onLoad: 'check-sso',
      checkLoginIframe: true,
      flow: 'standard',
      redirectUri: window.location.href
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 60000
      })
    ],
    providers: [
      AutoRefreshTokenService,
      UserActivityService,
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [includeTokenCondition]
      }
    ]
  } as ProvideKeycloakOptions;

  if (window.location.port === '4280') {
    return provideKeycloakMock(config);
  } else {
    return provideKeycloak(config);
  }
};
