import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConnectableObservable, Observable } from 'rxjs';
import { publishLast } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import { Country, Language } from '../_models';

import { ErrorService } from './error.service';

@Injectable()
export class CountriesService {
  constructor(private http: HttpClient, private errors: ErrorService) {}

  private countries?: Observable<Country[]>;
  private languages?: Observable<Language[]>;

  private requestCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url).pipe(this.errors.handleRetry());
  }

  getCountries(): Observable<Country[]> {
    if (this.countries) {
      return this.countries;
    }
    this.countries = this.requestCountries().pipe(publishLast());
    (this.countries as ConnectableObservable<Country[]>).connect();
    return this.countries;
  }

  private requestLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url).pipe(this.errors.handleRetry());
  }

  getLanguages(): Observable<Language[]> {
    if (this.languages) {
      return this.languages;
    }
    this.languages = this.requestLanguages().pipe(publishLast());
    (this.languages as ConnectableObservable<Language[]>).connect();
    return this.languages;
  }
}
