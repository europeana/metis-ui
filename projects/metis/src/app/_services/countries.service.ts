import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import { Country, Language } from '../_models';

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http = inject(HttpClient);

  private countries$?: Observable<Country[]>;
  private languages$?: Observable<Language[]>;

  /**
   * requestCountries
   * interacts with server to get list of countries
   */
  private requestCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url);
  }

  /**
   * requestLanguages
   * interacts with server to get list of languages
   */
  private requestLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url);
  }

  /**
   * getCountries
   * getter for countries list
   */
  getCountries(): Observable<Country[]> {
    this.countries$ ??= this.requestCountries().pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((err) => {
        this.countries$ = undefined;
        return throwError(() => err);
      })
    );
    return this.countries$;
  }

  /**
   * getLanguages
   * getter for languages list
   */
  getLanguages(): Observable<Language[]> {
    this.languages$ ??= this.requestLanguages().pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((err) => {
        this.languages$ = undefined;
        return throwError(() => err);
      })
    );
    return this.languages$;
  }
}
