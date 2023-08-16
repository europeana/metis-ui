import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaintenanceInterceptor } from './maintenance.interceptor';

export const MaintenanceInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: MaintenanceInterceptor,
  multi: true
};
