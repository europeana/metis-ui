import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiSettings } from '../../environments/apisettings';
import { SingleCache } from '../_helpers';
import { Country, Language } from '../_models';

import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  constructor(private readonly http: HttpClient, private readonly errors: ErrorService) {}

  private readonly countries = new SingleCache(() => this.requestCountries());
  private readonly languages = new SingleCache(() => this.requestLanguages());

  /** requestCountries
  /*
  /* interacts with server to get list of countries
  */
  private requestCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url).pipe(this.errors.handleRetry());
  }

  /** requestLanguages
  /*
  /* interacts with server to get list of languages
  */
  private requestLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url).pipe(this.errors.handleRetry());
  }

  /** getCountries
  /*
  /* getter for countries list
  */
  getCountries(): Observable<Country[]> {
    return this.countries.get();
  }

  /** getLanguages
  /*
  /* getter for languages list
  */
  getLanguages(): Observable<Language[]> {
    return this.languages.get();
  }
}
