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

  it('should provide', () => {
    TestBed.configureTestingModule({
      providers: [provideKeycloakMock({ config, initOptions })]
    });
    const keycloakMock = TestBed.inject(Keycloak);
    expect(keycloakMock).toBeDefined();
    expect(keycloakMock.authenticated).toBeFalsy();
    expect(keycloakMock.resourceAccess).toBeTruthy();
    expect(keycloakMock.resourceAccess?.europeana.roles).toEqual(['data-officer']);
  });

  it('should provide the unauthorised user', () => {
    const initOptionsRedirect403 = { ...initOptions, redirectUri: '/trigger/403' };
    TestBed.configureTestingModule({
      providers: [provideKeycloakMock({ config, initOptions: initOptionsRedirect403 })]
    });
    const keycloakMock = TestBed.inject(Keycloak);
    expect(keycloakMock).toBeDefined();
    expect(keycloakMock.authenticated).toBeFalsy();
    expect(keycloakMock.resourceAccess?.europeana.roles).toEqual(['']);
  });

  it('should re-route on logout', () => {
    TestBed.configureTestingModule({
      providers: [provideKeycloakMock({ config, initOptions })]
    });

    const keycloakMock = TestBed.inject(Keycloak);
    const router = TestBed.inject(Router);
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
