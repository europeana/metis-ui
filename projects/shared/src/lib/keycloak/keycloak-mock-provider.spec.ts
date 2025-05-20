import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KeycloakEventType } from 'keycloak-angular';
import { provideKeycloakMock } from './keycloak-mock-provider';

describe('keycloak mock provider', () => {
  const config: KeycloakConfig = {
    url: 'kc-server-url',
    realm: 'realm-name',
    clientId: 'client-id'
  };

  const initOptions: KeycloakInitOptions = {
    onLoad: 'login-required'
  };

  describe('Routing', () => {
    let router: Router;
    let keycloakMock: Keycloak;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideKeycloakMock({ config, initOptions })],
        imports: [RouterTestingModule]
      });
      router = TestBed.inject(Router);
      keycloakMock = TestBed.inject(Keycloak);
      TestBed.flushEffects();
    });

    it('should handle redirects', () => {
      const ob = (keycloakMock as unknown) as {
        handleRedirect: (x?: { redirectUri: string }) => void;
      };
      ob.handleRedirect();
      spyOn(router, 'navigate');
      expect(router.navigate).not.toHaveBeenCalled();
      ob.handleRedirect({ redirectUri: '/dataset/1?recordId=2' });
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/1'], {
        queryParams: { recordId: '2' }
      });
    });

    it('should provide', () => {
      expect(keycloakMock).toBeDefined();
      expect(keycloakMock.authenticated).toBeFalsy();
      expect(keycloakMock.resourceAccess).toBeTruthy();
      expect(keycloakMock.resourceAccess?.europeana.roles).toEqual(['data-officer']);
    });

    it('should re-route on logout', () => {
      const redirectUri = 'http://hello-redirect';

      spyOn(router, 'navigate');
      keycloakMock.logout();
      expect(router.navigate).not.toHaveBeenCalled();
      keycloakMock.logout({ redirectUri: redirectUri });
      expect(router.navigate).toHaveBeenCalledWith([redirectUri]);
    });

    it('should login', () => {
      spyOn(router, 'navigate');
      expect(keycloakMock.authenticated).toBeFalsy();
      keycloakMock.login();
      expect(keycloakMock.authenticated).toBeTruthy();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should login (options)', () => {
      spyOn(router, 'navigate');
      expect(keycloakMock.authenticated).toBeFalsy();
      keycloakMock.login({ redirectUri: '/dataset/' });
      expect(keycloakMock.authenticated).toBeTruthy();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should logout', () => {
      keycloakMock.authenticated = true;
      keycloakMock.logout();
      expect(keycloakMock.authenticated).toBeFalsy();
    });

    it('should login and out (signals)', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.AuthLogout);

      const testObject = (keycloakMock as unknown) as {
        authenticatedSignal: { set: (_: boolean) => void };
      };

      testObject.authenticatedSignal.set(true);
      TestBed.flushEffects();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.Ready);

      testObject.authenticatedSignal.set(false);
      TestBed.flushEffects();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.AuthLogout);

      testObject.authenticatedSignal.set(true);
      TestBed.flushEffects();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((keycloakMock as any).authenticatedEvent().type).toEqual(KeycloakEventType.Ready);
    });

    it('should load user data', () => {
      expect(keycloakMock.loadUserProfile()).toBeTruthy();
    });

    it('should create an account url', () => {
      expect(keycloakMock.createAccountUrl()).toBeTruthy();
    });
  });

  describe('Unauthorised', () => {
    let keycloakMock: Keycloak;

    beforeEach(() => {
      const initOptionsRedirect403 = { ...initOptions, redirectUri: '/trigger/403' };
      TestBed.configureTestingModule({
        providers: [provideKeycloakMock({ config, initOptions: initOptionsRedirect403 })]
      });
      keycloakMock = TestBed.inject(Keycloak);
      TestBed.flushEffects();
    });

    it('should provide the unauthorised user', () => {
      expect(keycloakMock).toBeDefined();
      expect(keycloakMock.authenticated).toBeFalsy();
      expect(keycloakMock.resourceAccess?.europeana.roles).toEqual(['']);
    });
  });
});
