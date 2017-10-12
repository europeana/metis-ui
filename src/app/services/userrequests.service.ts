import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable()
export class UserrequestsService {

  constructor(private http: HttpClient) {} 

  pendingRequests = [
    {id: 1, email: 'mirjam.verloop@europeana.eu', organization: 'Europeana', requestdate: '15-02-2017', requesttype: 'add', requeststatus: 'pending'},
    {id: 2, email: 'valentine.charles@europeana.eu', organization: 'Europeana', requestdate: '15-03-2017', requesttype: 'add', requeststatus: 'pending'},
    {id: 3, email: 'simon.tzanakis@europeana.eu', organization: 'Europeana', requestdate: '15-04-2017', requesttype: 'add', requeststatus: 'pending'}
  ];

  getPendingRequests() {
    return this.pendingRequests;
  }  
	

}