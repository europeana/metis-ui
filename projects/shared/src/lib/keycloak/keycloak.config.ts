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

import { provideKeycloakMock } from './keycloak-mock-provider';

interface KeycloakSettings {
  realm: string;
  url: string;
  clientId: string;
}

const includeTokenCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^((?!metis-maintenance).)*$/
});

export const provideKeycloakAngular = (
  keycloakSettings: KeycloakSettings
): Provider | EnvironmentProviders => {
  const config = {
    config: keycloakSettings,
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
