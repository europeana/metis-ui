import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, timer } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { Env, EnvItem, EnvItemKey, EnvPeriod } from '../_models';

@Injectable({ providedIn: 'root' })
export class RemoteEnvService {
  constructor(private readonly http: HttpClient) {}
  public apiSettings = apiSettings;

  /**
  /* periodIsNow
  /* @param { EnvPeriod } period
  /* @returns boolean
  **/
  periodIsNow(period: EnvPeriod): boolean {
    const pFrom = new Date(Date.parse(period.from));
    const pTo = new Date(Date.parse(period.to));
    const now = new Date();
    return now >= pFrom && now <= pTo;
  }

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
        if (envItem.period && !this.periodIsNow(envItem.period)) {
          apiSettings.remoteEnv.maintenanceMessage = '';
          return '';
        }
        apiSettings.remoteEnv.maintenanceMessage = envItem.maintenanceMessage as string;
        return envItem.maintenanceMessage;
      })
    );
  }
}
