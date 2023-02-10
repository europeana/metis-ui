import { ActivatedRouteSnapshot, BaseRouteReuseStrategy } from '@angular/router';

export class AppRouteReuseStrategy extends BaseRouteReuseStrategy {
  public shouldReuseRoute(_: ActivatedRouteSnapshot, __: ActivatedRouteSnapshot): boolean {
    return true;
  }
}
