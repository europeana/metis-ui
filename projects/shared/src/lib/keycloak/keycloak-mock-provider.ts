import {
  computed,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
  Provider,
  signal
} from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEvent,
  KeycloakEventType,
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
  authenticatedSignal = signal(false);
  authenticatedEvent = computed(() => {
    return ({
      type: this.authenticatedSignal() ? KeycloakEventType.Ready : KeycloakEventType.AuthLogout
    } as unknown) as KeycloakEvent;
  });

  idToken?: string;
  resourceAccess = { europeana: { roles: ['data-officer'] } };
  idTokenParsed = { sub: undefined as undefined | string };

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
    this.authenticatedSignal.set(true);

    this.idToken = '1234';
    this.idTokenParsed.sub = '1234';

    // fake token according to last number in the redirect
    if (ops) {
      const match = /\d+$/.exec(ops.redirectUri);
      if (match) {
        this.idToken = match[1];
        this.idTokenParsed.sub = match[1];
      }
    }

    this.handleRedirect(ops);
  }

  logout(ops?: FnParams): void {
    this.authenticated = false;
    this.authenticatedSignal.set(false);
    this.idToken = undefined;
    this.idTokenParsed.sub = undefined;
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

// expose instance of this class for the unit tests
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
  const keycloakMock = new MockKeycloak();
  const keycloak = (keycloakMock as unknown) as Keycloak;
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
      useValue: keycloakMock.authenticatedEvent
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
