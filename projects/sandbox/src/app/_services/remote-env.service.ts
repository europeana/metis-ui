import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, timer } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { Env, EnvItem, EnvItemKey } from '../_models';

@Injectable({ providedIn: 'root' })
export class RemoteEnvService {
  constructor(private readonly http: HttpClient) {}

  /**
  /* loadObervableEnv
  /* updates dynamic entry in apiSettings
  /* @returns Observable<string | undefined>
  **/
  loadObervableEnv(): Observable<string | undefined> {
    const url = apiSettings.remoteEnvUrl;
    const dataKey = apiSettings.remoteEnvKey as EnvItemKey;

    if (!(url && dataKey)) {
      return of('');
    }
    return timer(1, apiSettings.intervalMaintenance).pipe(
      switchMap(() => {
        return this.http.get<Env>(url);
      }),
      map((env: Env) => {
        return env[dataKey];
      }),
      map((envItem: EnvItem) => {
        if (envItem.period) {
          const pFrom = new Date(Date.parse(envItem.period.from));
          const pTo = new Date(Date.parse(envItem.period.to));
          const now = new Date();
          const periodIsNow = now > pFrom && now < pTo;
          if (!periodIsNow) {
            apiSettings.remoteEnv.maintenanceMessage = '';
            return '';
          }
        }
        apiSettings.remoteEnv.maintenanceMessage = envItem.maintenanceMessage as string;
        return envItem.maintenanceMessage;
      })
    );
  }
}
