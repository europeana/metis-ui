import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { ApiSettingsGeneric, EnvItemKey } from '../_models/remote-env';

export const MAINTENANCE_INTERCEPTOR_SETTINGS = new InjectionToken<ApiSettingsGeneric>('settings', {
  providedIn: 'root',
  factory: (): ApiSettingsGeneric => {
    return {
      intervalMaintenance: 0,
      remoteEnvKey: '' as EnvItemKey,
      remoteEnvUrl: '',
      remoteEnv: {}
    };
  }
});

@Injectable({ providedIn: 'root' })
export class MaintenanceInterceptor implements HttpInterceptor {
  constructor(@Inject(MAINTENANCE_INTERCEPTOR_SETTINGS) public settings: ApiSettingsGeneric) {}

  /** intercept
   * @param { HttpRequest } request
   * @param { HttpHandler } handler
   * @returns Observable<HttpEvent>
   **/
  intercept(request: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    const re = this.settings.remoteEnv;
    if (
      re &&
      re.maintenanceMessage &&
      re.maintenanceMessage.length &&
      request.url !== this.settings.remoteEnvUrl
    ) {
      return NEVER;
    } else {
      return handler.handle(request);
    }
  }
}
