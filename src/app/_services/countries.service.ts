import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';
import { environment } from '../../environments/environment';

import { AuthenticationService } from '../_services/authentication.service';
import { StringifyHttpError } from '../_helpers';

@Injectable()
export class CountriesService {

  constructor(private http: HttpClient, 
    private authentication: AuthenticationService, 
    private router: Router) {}

  /** getCountriesLanguages
  /* get a list of countries or languages
  /* @param {boolean} type - type of values to return, either country or language
  */
  getCountriesLanguages(type) {
    let url = `${apiSettings.apiHostCore}/${environment.apiDatasets}/countries`;        
    if (type === 'language') {
      url = `${apiSettings.apiHostCore}/${environment.apiDatasets}/langugaes`;  
    }
    return this.http.get(url).map(data => {      
      if (data) {
        return data;
      } else {
        return false;
      }
    });
  }

}

