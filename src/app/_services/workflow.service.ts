import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { apiSettings } from '../../environments/apisettings';

import 'rxjs/Rx';

@Injectable()
export class WorkflowService {

  constructor(private http: HttpClient) { }

  triggerNewWorkflow (id) {

  	const url = `https://metis-core-rest-test.eanadev.org/orchestrator/workflows/${id}/execute?workflowOwner=owner1&workflowName=workflow30&priority=0`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {      
      console.log(data);
    });

  }

}
