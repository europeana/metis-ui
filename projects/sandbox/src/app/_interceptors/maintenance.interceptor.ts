import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { NEVER, Observable } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';

@Injectable({ providedIn: 'root' })
export class MaintenanceInterceptor implements HttpInterceptor {
  /** intercept
   * @param { HttpRequest } request
   * @param { HttpHandler } handler
   * @returns Observable<HttpEvent>
   **/
  intercept(request: HttpRequest<unknown>, handler: HttpHandler): Observable<HttpEvent<unknown>> {
    const re = apiSettings.remoteEnv;
    if (
      re &&
      re.maintenanceMessage &&
      re.maintenanceMessage.length &&
      request.url !== apiSettings.remoteEnvUrl
    ) {
      return NEVER;
    } else {
      return handler.handle(request);
    }
  }
}
