import {
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  Provider,
  runInInjectionContext
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEvent,
  ProvideKeycloakOptions,
  UserActivityService
} from 'keycloak-angular';

import Keycloak from 'keycloak-js';

let router: Router;

export const mockedKeycloak = ((): Keycloak => {
  const _login = (): void => {
    mockedKeycloak.authenticated = true;
    mockedKeycloak.idToken = '1234';
  };

  const _logout = (): void => {
    mockedKeycloak.authenticated = false;
    mockedKeycloak.idToken = undefined;
  };

  const _handleRedirect = (ops?: { redirectUri: string }): void => {
    if (ops) {
      const newUrl = decodeURIComponent(ops.redirectUri);
      const routerUrl = newUrl.replace(document.location.origin, '');
      router.navigate([routerUrl]);
    }
  };

  return ({
    authenticated: false,
    idToken: null,
    login: (ops?: { redirectUri: string }): void => {
      _login();
      _handleRedirect(ops);
    },
    logout: (ops?: { redirectUri: string }): void => {
      _logout();
      _handleRedirect(ops);
    },
    resourceAccess: { europeana: { roles: ['data-officer'] } },
    loadUserProfile: () => {
      return new Promise((resolve) => {
        resolve({
          username: 'Valentine',
          firstName: 'Valentine',
          lastName: 'Charles',
          grantedRoles: {
            resourceRoles: ['data-officer']
          }
        });
      });
    }
  } as unknown) as Keycloak;
})();

const provideKeycloakInAppInitializer = (
  _: Keycloak,
  options: ProvideKeycloakOptions
): EnvironmentProviders | Provider[] => {
  const { initOptions, features = [] } = options;

  if (!initOptions) {
    return [];
  }

  return provideAppInitializer(async () => {
    const injector = inject(EnvironmentInjector);
    router = inject(Router);
    runInInjectionContext(injector, () => features.forEach((feature) => feature.configure()));
  });
};

// Define the bearer-token condition (this will exclude all CI requests, which are not https)
const localhostCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^https:/
});

export const provideKeycloakMock = (options: ProvideKeycloakOptions): EnvironmentProviders => {
  const keycloak = mockedKeycloak;

  return makeEnvironmentProviders([
    {
      provide: KEYCLOAK_EVENT_SIGNAL,
      useValue: (): KeycloakEvent => {
        return ({} as unknown) as KeycloakEvent;
      }
    },
    {
      provide: Keycloak,
      useValue: keycloak
    },
    {
      provide: AutoRefreshTokenService,
      useValue: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        start: (): void => {}
      }
    },
    {
      provide: UserActivityService,
      useValue: {}
    },
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [localhostCondition]
    },
    provideKeycloakInAppInitializer(keycloak, options)
  ]);
};
