
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { AuthenticationService } from '../_services/authentication.service';
import { StringifyHttpError } from '../_helpers';
import { ErrorService } from './error.service';

@Injectable()
export class CountriesService {

  constructor(private http: HttpClient, 
    private errors: ErrorService,
    private authentication: AuthenticationService) {}

  /** getCountriesLanguages
  /* get a list of countries or languages
  /* @param {boolean} type - type of values to return, either country or language
  */
  getCountriesLanguages(type) {
    let url = `${apiSettings.apiHostCore}/datasets/countries`;        
    if (type === 'language') {
      url = `${apiSettings.apiHostCore}/datasets/languages`;  
    }
    return this.http.get(url).pipe(map(data => {      
      if (data) {
        return data;
      } else {
        return false;
      }
    })).pipe(this.errors.handleRetry());  
  }

}

