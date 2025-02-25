import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const requiredRole = route.data['role'];

  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean => {
    return Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));
  };

  if (!authenticated) {
    const keycloak = inject(Keycloak);
    keycloak.login({ redirectUri: window.location.href });
    return false;
  }
  if (!hasRequiredRole(requiredRole)) {
    const router = inject(Router);
    router.navigate(['/home'], { queryParams: { showModalUnauthorised: true } });
    return false;
  }
  return true;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
