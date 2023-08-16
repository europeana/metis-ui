import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { ApiSettingsGeneric, EnvItemKey } from 'shared';

export const INTERCEPTOR_SETTINGS = new InjectionToken<ApiSettingsGeneric>(
  'settings',
  {
    providedIn: 'root',
    factory: () => {
      return {
        intervalMaintenance: 0,
        remoteEnvKey: '' as EnvItemKey,
        remoteEnvUrl: '',
        remoteEnv: {}
      } as ApiSettingsGeneric;
    },
  }
);

@Injectable({ providedIn: 'root' })
export class MaintenanceInterceptor implements HttpInterceptor {

  constructor(@Inject(INTERCEPTOR_SETTINGS) public settings: ApiSettingsGeneric) {}

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
