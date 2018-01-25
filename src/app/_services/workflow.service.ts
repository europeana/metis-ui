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
  activeTopolgy: any;
  activeExternalTaskId: any;
  allWorkflows: any;
  nextPage: number;

  triggerNewWorkflow (id, workflowName) {

  	const owner = 'owner1';
  	const workflow = workflowName;
  	const priority = 0;

  	const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&workflowName=${workflow}&priority=${priority}`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {   
    	if (data) {
        this.activeTopolgy = data['metisPlugins'][0]['topologyName']; // 0 for now
        this.activeExternalTaskId = data['metisPlugins'][0]['externalTaskId']; // 0 for now
        return data;
      } else {
        return false;
      }
    });

  }

  getLogs() {

    const topology = this.activeTopolgy;
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

   getReport(taskId, topologyName) {

    const topology = topologyName;
    const externalTaskId = taskId;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/report`;   
    
    return this.http.get(url).map(data => {   
      if (data) {
        return data;
      } else {
        return false;
      }
    });

  }

  getAllWorkflows(id, page?) {

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/82?workflowOwner=&workflowName=&workflowStatus=FINISHED&workflowStatus=CANCELLED&orderField=UPDATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        this.allWorkflows = data['results'];
        return data;
      } else {
        return false;
      }
    });

  }

  getRunningWorkflows(id) {

    // or inqueue
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=&workflowStatus=INQUEUE&workflowStatus=RUNNING&orderField=STARTED_DATE&ascending=false`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data['results'];
      } else {
        return false;
      }
    });

  }

  cancelThisWorkflow(id) {
    
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}`;   
    return this.http.delete(url).map(data => {   
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
