import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class OrganizationsService {

  constructor(private http: HttpClient) {} 

  organizations: {};
  apiurl = '';
  apiurlsuggest = '';
  apiurlroles = '';

	getOrganizations() {
    return false;
  }

  searchOrganizations(term: string) {
    return false;
  }

  getRoles(term: string) {
    return false;
  }

}