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

  @Output() changeWorkflow: EventEmitter<any> = new EventEmitter();
  activeWorkflow: any = 'workflow!';
  currentReport: any;

  triggerNewWorkflow (id) {

  	const owner = 'owner1';
  	const workflow = 'workflow30';
  	const priority = 0;

  	const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&workflowName=${workflow}&priority=${priority}`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {   
    	if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

  getLogs() {

    const topology = 'oai_harvest';
    const externalTaskId = '2070373127078497810';

    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/logs?from=1&to=100`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

   getReport() {

    const topology = 'oai_harvest';
    const externalTaskId = '2070373127078497810';

    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/report`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

  setCurrentReport(report): void {
    this.currentReport = report;
  }

  getCurrentReport() {
    return this.currentReport;
  }

  setActiveWorkflow(workflow): void {
    this.activeWorkflow = workflow;
    this.changeWorkflow.emit(this.activeWorkflow);
  }

}
