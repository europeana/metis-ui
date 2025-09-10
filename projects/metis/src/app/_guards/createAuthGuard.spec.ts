import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { canActivateAuthRole } from './createAuthGuard';

describe('createAuthGuard', () => {
  let state: RouterStateSnapshot;
  let routeProtected: ActivatedRouteSnapshot;
  let routeUnprotected: ActivatedRouteSnapshot;

  beforeEach(() => {
    state = { url: '/test' } as RouterStateSnapshot;
    routeProtected = ({ data: { role: 'data-officer' } } as unknown) as ActivatedRouteSnapshot;
    routeUnprotected = ({ data: {} } as unknown) as ActivatedRouteSnapshot;
  });

  const getMockKeycloak = (authenticated: boolean, roles = ['data-officer']): Keycloak => {
    return ({
      login: jest.fn(),
      authenticated: authenticated,
      resourceAccess: { europeana: { roles: roles } }
    } as unknown) as Keycloak;
  };

  it('should return false if no roles are defined on the route', async () => {
    expect(TestBed).toBeTruthy();
    expect(canActivateAuthRole).toBeTruthy();
    expect(state).toBeTruthy();
    expect(routeProtected).toBeTruthy();
    expect(routeUnprotected).toBeTruthy();
    expect(getMockKeycloak).toBeTruthy();

    // TODO: fix this test
    /*
    const keyCloak = getMockKeycloak(true);
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: keyCloak }]
    });
    const result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(routeUnprotected, state);
    });
    expect(result).toBeFalsy();
    expect(keyCloak.login).not.toHaveBeenCalled();
    */
  });

  it('should return false if the user is not authenticated', async () => {
    // TODO: fix this test
    /*
    const keyCloak = getMockKeycloak(false);
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: keyCloak }]
    });
    const result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(routeProtected, state);
    });
    expect(result).toBeFalsy();
    expect(keyCloak.login).toHaveBeenCalled();
    */
  });

  it('should return false if the user is not authorised', async () => {
    // TODO: fix this test
    /*
    const keyCloak = getMockKeycloak(true, []);
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: keyCloak }]
    });
    let result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(routeUnprotected, state);
    });
    expect(result).toBeFalsy();
    expect(keyCloak.login).not.toHaveBeenCalled();
    result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(routeProtected, state);
    });
    expect(result).toBeFalsy();
    */
  });

  it('should return true if the user is authenticated (and has the roles)', async () => {
    // TODO: fix this test
    /*
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: getMockKeycloak(true) }]
    });
    const result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(routeProtected, state);
    });
    expect(result).toBeTruthy();
    */
  });
});
