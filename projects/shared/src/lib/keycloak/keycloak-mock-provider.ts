import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  Provider
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
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

interface FnParams {
  redirectUri: string;
}

class MockKeycloak {
  authenticated = false;
  idToken?: string;
  resourceAccess = { europeana: { roles: ['data-officer'] } };

  handleRedirect(ops?: FnParams): void {
    if (ops) {
      let newUrl = decodeURIComponent(ops.redirectUri).replace(document.location.origin, '');
      const params: NavigationExtras = {};

      newUrl = decodeURIComponent(newUrl);

      const arr = newUrl.split('?');

      if (arr.length > 1) {
        arr[1].split('&').forEach((qp: string) => {
          const qpArr = qp.split('=');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (params as any)[qpArr[0]] = qpArr[1];
        });
      }

      if (Object.keys(params).length > 0) {
        router.navigate([arr[0]], { queryParams: params });
      } else {
        router.navigate([newUrl]);
      }
    }
  }

  createAccountUrl(): string {
    return 'https://europeana-account-page.html';
  }

  login(ops?: FnParams): void {
    this.authenticated = true;
    this.idToken = '1234';
    this.handleRedirect(ops);
  }

  logout(ops?: FnParams): void {
    this.authenticated = false;
    this.idToken = undefined;
    this.handleRedirect(ops);
  }

  loadUserProfile(): Promise<unknown> {
    return new Promise((resolve) => {
      const res = {
        username: 'Valentine',
        firstName: 'Valentine',
        lastName: 'Charles',
        grantedRoles: {
          resourceRoles: ['data-officer']
        }
      };
      resolve(res);
    });
  }
}

export const mockedKeycloak = (new MockKeycloak() as unknown) as Keycloak;

const provideKeycloakInAppInitializer = (
  _: Keycloak,
  __: ProvideKeycloakOptions
): EnvironmentProviders | Provider[] => {
  return provideAppInitializer(async () => {
    router = inject(Router);
  });
};

// Define the bearer-token condition (this will exclude all CI requests, which are not https)
const localhostCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^https:/
});

export const provideKeycloakMock = (options: ProvideKeycloakOptions): EnvironmentProviders => {
  const keycloak = (new MockKeycloak() as unknown) as Keycloak;
  const override = (keycloak as unknown) as {
    resourceAccess: { europeana: { roles: Array<string> } };
  };

  // remove roles if we're testing unauthorised users
  if (
    options.initOptions &&
    options.initOptions.redirectUri &&
    options.initOptions.redirectUri.indexOf('403') > -1
  ) {
    override.resourceAccess.europeana.roles = [''];
  }

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
    AutoRefreshTokenService,
    UserActivityService,
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [localhostCondition]
    },
    provideKeycloakInAppInitializer(keycloak, options)
  ]);
};
