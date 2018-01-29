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
  @Output() selectedWorkflow: EventEmitter<any> = new EventEmitter();
  @Output() workflowIsDone: EventEmitter<any> = new EventEmitter();
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
    const externalTaskId = this.activeExternalTaskId;
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

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        this.allWorkflows = data['results'];
        return data;
      } else {
        return false;
      }
    });

  }

  getLastWorkflow(id) {

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=&workflowStatus=&orderField=CREATED_DATE&ascending=false`;   
    return this.http.get(url).map(data => {   
      if (data) {
        if (data['results'][0]) {
          this.activeTopolgy = data['results'][0]['metisPlugins'][0]['topologyName']; // 0 for now
          this.activeExternalTaskId = data['results'][0]['metisPlugins'][0]['externalTaskId']; // 0 for now
        }
        return data['results'][0];
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

  setActiveWorkflow(workflow?): void {

    if (!workflow) {
      workflow = '';
    }

    this.activeWorkflow = workflow;
    this.changeWorkflow.emit(this.activeWorkflow);

  }

  selectWorkflow(workflow): void {
    this.selectedWorkflow.emit(workflow);
  }

  workflowDone(status): void {
    this.workflowIsDone.emit(status);
  }

}
