import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, ModelSignal } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { apiSettings } from '../../environments/apisettings';
import { DebiasDereferenceResult, DebiasInfo, DebiasReport, DebiasState } from '../_models';

@Injectable({ providedIn: 'root' })
export class DebiasService {
  private readonly http = inject(HttpClient);

  dereferencedSuggestion: string;

  runDebiasReport(datasetId: string): Observable<boolean> {
    return this.http.post<boolean>(`${apiSettings.apiHost}/dataset/${datasetId}/debias`, {});
  }

  getDebiasReport(datasetId: string): Observable<DebiasReport> {
    return this.http.get<DebiasReport>(`${apiSettings.apiHost}/dataset/${datasetId}/debias/report`);
  }

  getDebiasInfo(datasetId: string): Observable<DebiasInfo> {
    return this.http.get<DebiasInfo>(`${apiSettings.apiHost}/dataset/${datasetId}/debias/info`);
  }

  pollDebiasInfo(datasetId: string, signal: ModelSignal<DebiasInfo>): void {
    console.log('enter pollDebiasInfo: ' + datasetId);
    timer(apiSettings.interval)
      .pipe(
        switchMap(() => {
          return this.getDebiasInfo(datasetId);
        }),
        takeWhile((info: DebiasInfo) => {
          signal.set(info);
          return ![DebiasState.COMPLETED, DebiasState.ERROR].includes(info.state);
        })
      )
      .subscribe();
  }

  derefDebiasInfo(debiasUrl: string): Observable<DebiasDereferenceResult> {
    const headers = new HttpHeaders().set('accept', 'application/json');
    const url = `${apiSettings.apiHostDereference}/dereference?uri=${encodeURIComponent(
      debiasUrl
    )}`;
    return this.http.get<DebiasDereferenceResult>(url, {
      headers: headers
    });
  }
}
