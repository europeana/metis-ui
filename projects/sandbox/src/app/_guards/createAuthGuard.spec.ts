import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { canActivateAuthRole } from './createAuthGuard';

describe('createAuthGuard', () => {
  let state: RouterStateSnapshot;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    state = { url: '/test' } as RouterStateSnapshot;
    route = ({ data: { role: 'data-officer' } } as unknown) as ActivatedRouteSnapshot;
  });

  const getMockKeycloak = (authenticated: boolean): Keycloak => {
    return ({
      login: jasmine.createSpy(),
      authenticated: authenticated,
      resourceAccess: { europeana: {} }
    } as unknown) as Keycloak;
  };

  it('should return false if the user is not authenticated', async () => {
    const keyCloak = getMockKeycloak(false);
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: keyCloak }]
    });
    const result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(route, state);
    });
    expect(result).toBeFalse();
    expect(keyCloak.login).toHaveBeenCalled();
  });

  it('should return true if the user is authenticated', async () => {
    const keyCloak = getMockKeycloak(false);
    TestBed.configureTestingModule({
      providers: [{ provide: Keycloak, useValue: getMockKeycloak(true) }]
    });
    const result = await TestBed.runInInjectionContext(() => {
      return canActivateAuthRole(route, state);
    });
    expect(result).toBeTrue();
    expect(keyCloak.login).not.toHaveBeenCalled();
  });
});
