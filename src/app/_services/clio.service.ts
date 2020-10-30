import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiSettings } from '../../environments/apisettings';
import { ClioData } from '../_models';

@Injectable({ providedIn: 'root' })
export class ClioService {
  constructor(private readonly http: HttpClient) {}

  loadClioData(datasetId: string): Observable<ClioData[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/clio/${datasetId}`;
    return this.http.get<ClioData[]>(url);
  }
}
