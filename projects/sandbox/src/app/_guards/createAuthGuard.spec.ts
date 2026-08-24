import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuardData } from 'keycloak-angular';
import { signal } from '@angular/core';
import { isAccessAllowed } from './createAuthGuard';
import { KeycloakAuthService } from '../_services/keycloak-auth.service';

describe('canActivateAuthRole - Core Logic', () => {
  let state: RouterStateSnapshot;
  let route: ActivatedRouteSnapshot;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(() => {
    state = { url: '/test' } as RouterStateSnapshot;
    route = ({ data: { role: 'data-officer' } } as unknown) as ActivatedRouteSnapshot;

    mockRouter = {
      parseUrl: vi
        .fn()
        .mockImplementation((url: string) => (`UrlTree(${url})` as unknown) as UrlTree)
    };

    mockAuthService = {
      login: vi.fn(),
      isAuthenticated: signal(false)
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: KeycloakAuthService, useValue: mockAuthService }
      ]
    });
  });

  const runGuardInContext = async (authenticated: boolean) => {
    const mockAuthData: AuthGuardData = {
      authenticated,
      grantedRoles: { realmRoles: [], resourceRoles: {} },
      keycloak: {} as any
    };

    // 🚀 EXECUTE DIRECTLY: Runs your real code inside a synchronous injection context cleanly
    return await TestBed.runInInjectionContext(async () => {
      return await isAccessAllowed(route, state, mockAuthData);
    });
  };

  it('should return a fallback UrlTree and trigger login if the user is not authenticated', async () => {
    const result = await runGuardInContext(false);

    expect(result).toBe('UrlTree(/)');
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should return true if the user is authenticated', async () => {
    const result = await runGuardInContext(true);

    expect(result).toBe(true);
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
