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

export const isAccessAllowed = async (
  _: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const authService = inject(KeycloakAuthService);

  if (!authData.authenticated) {
    authService.login();
    return router.parseUrl('/');
  }

  return true;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
