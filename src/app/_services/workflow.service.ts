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
  currentPlugin = 0; // pick the first plugin for now

  /* triggerNewWorkflow
    trigger a new workflow
  */
  triggerNewWorkflow (id, workflowName) {
  	const owner = 'owner1';
  	const workflow = workflowName;
  	const priority = 0;

  	const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&workflowName=${workflow}&priority=${priority}`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {   
    	if (data) {
        this.activeTopolgy = data['metisPlugins'][this.currentPlugin]['topologyName']; 
        this.activeExternalTaskId = data['metisPlugins'][this.currentPlugin]['externalTaskId']; 
        return data;
      } else {
        return false;
      }
    });
  }

  /* getLogs
    get logging information using topology and externaltaskid
  */
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

  /* getReport
    get report information using topology and externaltaskid
  */
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

  /* getAllExecutions
    get history of executions for specific datasetid, possible to retrieve results for a specific page
  */
  getAllExecutions(id, page?) {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowStatus=FINISHED&workflowStatus=CANCELLED&workflowName=&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        this.allWorkflows = data['results'];
        return data;
      } else {
        return false;
      }
    });
  }

  /* getLastExecution
    get most recent execution for specific datasetid
  */
  getLastExecution(id) {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=&workflowStatus=&orderField=CREATED_DATE&ascending=false`;   
    return this.http.get(url).map(data => {   
      if (data) {
        let latestWorkflow = data['results'][0];
        if (latestWorkflow) {
          this.activeTopolgy = latestWorkflow['metisPlugins'][this.currentPlugin]['topologyName']; 
          this.activeExternalTaskId = latestWorkflow['metisPlugins'][this.currentPlugin]['externalTaskId'];
        }
        return data['results'][0];
      } else {
        return false;
      }
    });
  }

  getWorkflows() {
    let workflows = ['workflow30'];
    return workflows ;
  }

  /* cancelThisWorkflow
    cancel the running execution for a datasetid
  */
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

  /* setCurrentReport
    set content for selected report 
  */
  setCurrentReport(report): void {
    this.currentReport = report;
  }

  /* getCurrentReport
    get content for selected report
  */
  getCurrentReport() {
    return this.currentReport;
  }

  /* setActiveWorkflow
    set active workflow and emit changes so other components can act upon
  */
  setActiveWorkflow(workflow?): void {
    if (!workflow) {
      workflow = undefined;
    }
    this.activeWorkflow = workflow;
    this.changeWorkflow.emit(this.activeWorkflow);
  }

  /* selectWorkflow
    set selected workflow, and emit changes so other components can act upon
  */
  selectWorkflow(workflow): void {
    this.selectedWorkflow.emit(workflow);
  }

  /* workflowDone
    indicate when workflow is done, and emit changes so other components can act upon
  */
  workflowDone(status): void {
    this.workflowIsDone.emit(status);
  }

}
