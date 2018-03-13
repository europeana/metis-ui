import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { apiSettings } from '../../environments/apisettings';
import { statistics, xslt } from '../_mocked/xslt';

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
  currentPage: Array<any> = [];

  /** triggerNewWorkflow
  /*  trigger a new workflow
  /* @param {number} id - dataset identifier
  /* @param {string} workflowName - name of the workflow
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

  /** getLogs
  /*  get logging information using topology and externaltaskid
  /* @param {number} taskId - identifier of task, optional
  /* @param {string} topologyName - name of the topology, optional
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

  /** getReport
  /*  get report information using topology and externaltaskid
  /* @param {number} taskId - identifier of task
  /* @param {string} topologyName - name of the topology
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

  /** getAllExecutions
  /*  get history of executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {number} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  /* @param {string} workflow - name of the workflow, optional
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

  /** getAllFinishedExecutions
  /*  get history of finished executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {number} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  /* @param {string} workflow - name of the workflow, optional
  */
  getAllFinishedExecutions(id, page?, workflow?) {
    if (workflow === undefined) { workflow = ''; }
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowName=${workflow}&workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data;
      } else {
        return false;
      }
    });
  }

  /** getLastExecution
  /*  get most recent execution for specific datasetid
  /* @param {number} id - identifier of dataset
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

  /** getOngoingExecutionsPerOrganisation
  /*  get all ongoing (either running or inqueue) executions for the user's organisation
  /* @param {number} page - number of next page
  /* @param {boolean} ongoing - ongoing executions only, optional
  /* @param {string} workflow - selected workflow, optional
  */
  getAllExecutionsPerOrganisation(page, ongoing?, workflow?) {

    console.log('getAllExecutionsPerOrganisation', page, ongoing, workflow);

    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?workflowOwner=&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;  
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    if (workflow) {
      url += "&workflowName="+workflow;
    }

    console.log(url);

    return this.http.get(url).map(data => {  
      if (data) {
        return data;
      } else {
        return false;
      }
    });
  }

  /** getWorkflows
  /* get a list of currently available workflows
  /* still mocked for now
  */
  getWorkflows() {
    let workflows = ['only_harvest', 
      'only_validation_external_mocked', 
      'only_validation_external', 
      'only_transformation',
      'only_transformation_mocked',
      'only_validation_internal',
      'only_validation_internal_mocked',
      'only_enrichment',
      'only_enrichment_mocked',
      'harvest_and_validation_external', 
      'harvest_and_validation_external_mocked'];
    return workflows;
  }

  /** cancelThisWorkflow
  /* cancel the running execution for a datasetid
  /* @param {number} id - id of the workflow
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

  /** getWorkflowSamples
  /* return samples based on executionid and plugintype
  /* @param {number} executionId - id of the execution
  /* @param {string} pluginType - name of the plugin
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

  /** getStatistics
  /*  get statistics for a certain dataset
  /* mocked data for now
  */
  getStatistics() {
    return statistics;
  }

   /** getXSLT
  /*  get xslt for a certain dataset
  /* mocked data for now
  */
  getXSLT() {
    return xslt;
  }
  
  /** setCurrentReport
  /* set content for selected report 
  /* @param {object} report - data of current report
  */
  setCurrentReport(report): void {
    this.currentReport = report;
  }

  /** getCurrentReport
  /* get content for selected report
  */
  getCurrentReport() {
    return this.currentReport;
  }

  /** setCurrentPageNumberForComponent
  /*  set currentpage to current page number 
  /*  for a specific component
  /*  a page is a new set of results (pagination for list/table of results)
  /* @param {number} page - number of the current page
  /* @param {string} component - for this specific component
  */
  setCurrentPageNumberForComponent(page, component): void {
    this.currentPage[component] = page;
  }

  /** getCurrentPageNumberForComponent
  /*  get the current page number for the specific component
  /* @param {string} component - for this specific component
  */
  getCurrentPageNumberForComponent(component) {
    return this.currentPage[component];
  }

  /** setActiveWorkflow
  /*  set active workflow and emit changes so other components can act upon
  /* @param {string} workflow - name of the workflow that is currenty running/active
  */
  setActiveWorkflow(workflow?): void {
    if (!workflow) {
      workflow = undefined;
    }
    this.activeWorkflow = workflow;
    this.changeWorkflow.emit(this.activeWorkflow);
  }

  /** selectWorkflow
  /*  set selected workflow, and emit changes so other components can act upon
  /* @param {string} workflow - name of the workflow that is selected
  */
  selectWorkflow(workflow): void {
    this.selectedWorkflow.emit(workflow);
  }

  /** workflowDone
  /*  indicate when workflow is done, and emit changes so other components can act upon
  /* @param {string} status - status of the workflow that just finished running
  */
  workflowDone(status): void {
    this.workflowIsDone.emit(status);
  }
}
