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
    return this.http.get(this.apiurl).map((res:Response) => res);
  }

  searchOrganizations(term: string) {
    return this.http.get(this.apiurlsuggest + term).map((res:Response) => res);
  }

  getRoles(term: string) {
    return this.http.get(this.apiurlroles).map((res:Response) => res);
  }

}