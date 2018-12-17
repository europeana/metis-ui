import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiSettings } from '../../environments/apisettings';
import { SingleCache } from '../_helpers';
import { Country, Language } from '../_models';

import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  constructor(private http: HttpClient, private errors: ErrorService) {}

  private countries = new SingleCache(() => this.requestCountries());
  private languages = new SingleCache(() => this.requestLanguages());

  private requestCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url).pipe(this.errors.handleRetry());
  }

  private requestLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url).pipe(this.errors.handleRetry());
  }

  getCountries(): Observable<Country[]> {
    return this.countries.get();
  }

  getLanguages(): Observable<Language[]> {
    return this.languages.get();
  }
}
