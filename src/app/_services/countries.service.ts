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

  getCountries() {

    const url = `${apiSettings.apiHostCore}/${environment.apiDatasets}/countries`;    
    return this.http.get(url).map(data => {      
      if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

  getLanguages() {
    
    const url = `${apiSettings.apiHostCore}/${environment.apiDatasets}/languages`;    
    return this.http.get(url).map(data => {      
      if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

}

