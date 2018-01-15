import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { apiSettings } from '../../environments/apisettings';

import 'rxjs/Rx';

@Injectable()
export class WorkflowService {

  constructor(private http: HttpClient) { }

  triggerNewWorkflow (id) {

  	const owner = 'owner1';
  	const workflow = 'workflow30';
  	const priority = 0;

  	const url = `https://metis-core-rest-test.eanadev.org/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&workflowName=${workflow}&priority=${priority}`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {      
    	if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

}
