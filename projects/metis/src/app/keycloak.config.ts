import { EnvironmentProviders, Provider } from '@angular/core';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken
} from 'keycloak-angular';

const localhostCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(https:)/
});

const url = 'https://auth.europeana.eu/auth';
const realm = 'europeana';
const clientId = 'metis-ui';

export const provideKeycloakAngular = (): Provider | EnvironmentProviders =>
  provideKeycloak({
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
        useValue: [localhostCondition]
      }
    ]
  });
