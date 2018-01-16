import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import { environment } from '../../environments/environment';
import { apiSettings } from '../../environments/apisettings';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/Rx';

@Injectable()
export class WorkflowService {

  constructor(private http: HttpClient) { }

  @Output() changeWorkflow: EventEmitter<boolean> = new EventEmitter();
  activeWorkflow: any = 'workflow!';

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

  setActiveWorkflow(workflow): void {
    this.activeWorkflow = workflow;
    this.changeWorkflow.emit(this.activeWorkflow);
  }

}
