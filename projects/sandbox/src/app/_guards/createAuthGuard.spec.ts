import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuardData } from 'keycloak-angular';
import { signal } from '@angular/core';

import { canActivateAuthRole } from './createAuthGuard';
import { KeycloakAuthService } from '../_services/keycloak-auth.service';

describe('canActivateAuthRole', () => {
  let state: RouterStateSnapshot;
  let route: ActivatedRouteSnapshot;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(() => {
    state = { url: '/test' } as RouterStateSnapshot;
    route = ({ data: { role: 'data-officer' } } as unknown) as ActivatedRouteSnapshot;

    // 1. Mock the Router to intercept and evaluate generated fallback trees
    mockRouter = {
      parseUrl: vi
        .fn()
        .mockImplementation((url: string) => (`UrlTree(${url})` as unknown) as UrlTree)
    };

    // 2. Mock your KeycloakAuthService wrapper logic
    mockAuthService = {
      login: vi.fn(),
      isAuthenticated: signal(false) // Initial state set to false
    };
  });

  /**
   * Helper function to mock the internal AuthGuardData passed down by keycloak-angular
   */
  const runGuardInContext = async (authenticated: boolean) => {
    const mockAuthData: AuthGuardData = {
      authenticated,
      grantedRoles: { realmRoles: [], resourceRoles: {} },
      keycloak: {} as any
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });

    // We override createAuthGuard wrapper execution parameters by mocking the functional guard evaluation
    return await TestBed.runInInjectionContext(() => {
      // Extract the underlying check function inside the functional guard wrapper chain
      // If keycloak-angular executes it directly, you can pass the mock data down the execution line
      return (canActivateAuthRole as any).wrappedFn(route, state, mockAuthData);
    });
  };

  it('should return a fallback UrlTree and trigger login if the user is not authenticated', async () => {
    const result = await runGuardInContext(false);

    // 3. Update assertions to expect structural Route Trees instead of flat falsy values
    expect(result).toBe('UrlTree(/)');
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should return true if the user is authenticated', async () => {
    const result = await runGuardInContext(true);

    expect(result).toBe(true);
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
