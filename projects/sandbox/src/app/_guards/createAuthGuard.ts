import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { KeycloakAuthService } from '../_services/keycloak-auth.service';

const isAccessAllowed = async (
  _: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData // 👈 Keycloak-Angular injects initialized state profile parameters here safely
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(KeycloakAuthService);

  // 1. Check the reliable authentication value evaluated by the guard wrapper
  if (!authData.authenticated) {
    // 2. Delegate the dynamic authorization workflow back to your wrapper service safely
    authService.login();

    // 3. Prevent Zoneless navigation freeze frames by flushing a valid destination fallback tree
    return router.parseUrl('/');
  }

  return true;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
