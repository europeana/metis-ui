import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class OrganizationsService {

  constructor(private http: HttpClient) {} 

  organizations: {};
  apiurl = 'http://metis-core-rest-test.cfapps.io/organizations?apikey=public_r';
  apiurlsuggest = 'http://metis-core-rest-test.cfapps.io/organizations/suggest?apikey=public_r&searchTerm=';
  apiurlroles = 'http://metis-core-rest-test.cfapps.io/organizations/roles?apikey=public_r&organizationRoles=EUROPEANA';

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