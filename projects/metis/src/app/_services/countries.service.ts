import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SingleCache } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { Country, Language } from '../_models';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  constructor(private readonly http: HttpClient) {}

  private readonly countries = new SingleCache(() => this.requestCountries());
  private readonly languages = new SingleCache(() => this.requestLanguages());

  /** requestCountries
  /*
  /* interacts with server to get list of countries
  */
  private requestCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url);
  }

  /** requestLanguages
  /*
  /* interacts with server to get list of languages
  */
  private requestLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url);
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
