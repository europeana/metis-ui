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
  activeWorkflow: any;
  currentReport: any;
  activeTopolgy: any;
  activeExternalTaskId: any;
  allWorkflows: any;
  currentPlugin: number = 0; // pick the first plugin for now
  currentPage: number = 0;

  /* triggerNewWorkflow
    trigger a new workflow
  */
  public triggerNewWorkflow (id, workflowName) {
  	const owner = 'owner1';
  	let workflow = workflowName;
  	const priority = 0;
    let enforce = '';

    if (workflow === 'transformation_enforce_oaipmh') {
      workflow = 'only_transformation';
      enforce = 'OAIPMH_HARVEST';
    }

  	const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&workflowName=${workflow}&priority=${priority}&enforcedPluginType=${enforce}`;    
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
  getLogs(taskId?, topologyName?) {
    const topology = topologyName ? topologyName : this.activeTopolgy;
    const externalTaskId = taskId ? taskId : this.activeExternalTaskId;
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
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/report?idsPerError=100`;   
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
  getAllExecutions(id, page?, workflow?) {
    if (workflow === undefined) { workflow = ''; }
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=${workflow}&workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        this.allWorkflows = data['results'];
        return data;
      } else {
        return false;
      }
    });
  }

  /* getAllFinishedExecutions
    get history of finished executions for specific datasetid, possible to retrieve results for a specific page
  */
  getAllFinishedExecutions(id, page?, workflow?) {
    if (workflow === undefined) { workflow = ''; }
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=${workflow}&workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data['results'];
      } else {
        return false;
      }
    });
  }

  /* getLastExecution
    get most recent execution for specific datasetid
  */
  getLastExecution(id) {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=&orderField=CREATED_DATE&ascending=false`;   
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

  /* getOngoingExecutionsPerOrganisation 
    get all ongoing (either running or inqueue) executions for the user's organisation
  */
  getOngoingExecutionsPerOrganisation() {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?workflowOwner=&workflowStatus=INQUEUE&workflowStatus=RUNNING&orderField=CREATED_DATE&ascending=true`;   
    return this.http.get(url).map(data => {  
      if (data) {
        return data['results'];
      } else {
        return false;
      }
    });
  }

  /* getWorkflows 
    get a list of currently available workflows
  */
  getWorkflows() {
    let workflows = ['only_harvest', 
      'only_validation_external_mocked', 
      'only_validation_external', 
      'only_transformation',
      'only_transformation_mocked',
      'only_validation_internal',
      'only_validation_internal_mocked',
      'harvest_and_validation_external', 
      'harvest_and_validation_external_mocked'];
    return workflows;
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

  /* getWorkflowSamples
    return samples based on executionid and plugintype
  */
  getWorkflowSamples(executionId, pluginType) {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data['records'];
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

  /* setCurrentPage
    set currentpage to current page number
  */
  setCurrentPage(page): void {
    this.currentPage = page;
  }

  /* getCurrentPage
    get the current page
  */
  getCurrentPage() {
    return this.currentPage;
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
