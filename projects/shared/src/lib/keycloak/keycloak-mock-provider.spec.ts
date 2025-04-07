import Keycloak, { KeycloakConfig, KeycloakInitOptions } from 'keycloak-js';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { mockedKeycloak, provideKeycloakMock } from './keycloak-mock-provider';

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
        providers: [provideKeycloakMock({ config, initOptions })]
      });
      router = TestBed.inject(Router);
      keycloakMock = TestBed.inject(Keycloak);
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
      expect(mockedKeycloak.authenticated).toBeFalsy();
      mockedKeycloak.login();
      expect(mockedKeycloak.authenticated).toBeTruthy();
    });

    it('should logout', () => {
      mockedKeycloak.authenticated = true;
      mockedKeycloak.logout();
      expect(mockedKeycloak.authenticated).toBeFalsy();
    });

    it('should load user data', () => {
      expect(mockedKeycloak.loadUserProfile()).toBeTruthy();
    });

    it('should create an account url', () => {
      expect(mockedKeycloak.createAccountUrl()).toBeTruthy();
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
    });

    it('should provide the unauthorised user', () => {
      expect(keycloakMock).toBeDefined();
      expect(keycloakMock.authenticated).toBeFalsy();
      expect(keycloakMock.resourceAccess?.europeana.roles).toEqual(['']);
    });
  });
});
