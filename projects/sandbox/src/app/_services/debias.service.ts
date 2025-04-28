import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import { DebiasInfo, DebiasReport } from '../_models';

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

  derefDebiasInfo(debiasUrl: string): Observable<string> {
    const headers = new HttpHeaders().set('accept', 'application/json');
    const url = `${apiSettings.apiHostDereference}/dereference?uri=${encodeURIComponent(
      debiasUrl
    )}`;
    return this.http.get<string>(url, {
      headers: headers
    });
  }
}
