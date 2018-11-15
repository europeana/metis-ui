import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { AuthenticationService } from '../_services/authentication.service';
import { StringifyHttpError } from '../_helpers';
import { ErrorService } from './error.service';
import { Country } from '../_models/country';
import { Language } from '../_models/language';

@Injectable()
export class CountriesService {

  constructor(private http: HttpClient,
    private errors: ErrorService,
    private authentication: AuthenticationService) {}

  /** getCountries
  /* get a list of countries
  */
  getCountries(): Observable<Country[]> {
    const url = `${apiSettings.apiHostCore}/datasets/countries`;
    return this.http.get<Country[]>(url).pipe(this.errors.handleRetry());
  }

  /** getLanguages
  /* get a list of languages
  */
  getLanguages(): Observable<Language[]> {
    const url = `${apiSettings.apiHostCore}/datasets/languages`;
    return this.http.get<Language[]>(url).pipe(this.errors.handleRetry());
  }
}
