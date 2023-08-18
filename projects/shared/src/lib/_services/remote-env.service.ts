import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, timer } from 'rxjs';
import { ApiSettingsGeneric, Env, EnvItem, EnvItemKey, EnvPeriod } from '../_models/remote-env';

@Injectable({ providedIn: 'root' })
export class RemoteEnvService {
  apiSettingsGeneric: ApiSettingsGeneric;

  setApiSettings(settings: ApiSettingsGeneric): void {
    this.apiSettingsGeneric = settings;
  }

  constructor(private readonly http: HttpClient) {}

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
  /* updates dynamic entry in apiSettingsGeneric
  /* @returns Observable<EnvItem | undefined>
  **/
  loadObervableEnv(): Observable<EnvItem | undefined> {
    const url = this.apiSettingsGeneric.remoteEnvUrl;
    const dataKey = this.apiSettingsGeneric.remoteEnvKey as EnvItemKey;

    if (!(url && dataKey)) {
      return of(undefined);
    }
    return timer(1, this.apiSettingsGeneric.intervalMaintenance).pipe(
      switchMap(() => {
        return this.http.get<Env>(url);
      }),
      map((env: Env) => {
        return env[dataKey];
      }),
      map((envItem: EnvItem) => {
        if (envItem.period && !this.periodIsNow(envItem.period)) {
          this.apiSettingsGeneric.remoteEnv.maintenanceMessage = '';
          return undefined;
        }
        // flag interception via global settings
        this.apiSettingsGeneric.remoteEnv.maintenanceMessage = envItem.maintenanceMessage as string;
        return envItem;
      })
    );
  }
}
