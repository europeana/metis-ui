import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  @Output() ongoingExecutionIsDone: EventEmitter<any> = new EventEmitter();

  activeWorkflow: any;
  currentReport: any;
  activeTopolgy: any;
  activeExternalTaskId: any;
  allWorkflows: any;
  currentPage: Array<any> = [];

  /** createWorkflow
  /*  create or override a workflow for specific dataset
  /* @param {number} id - dataset identifier
  */
  createWorkflow (id) {
    // next up
  }

  /** triggerNewWorkflow
  /*  trigger a new workflow
  /* @param {number} id - dataset identifier
  */
  public triggerNewWorkflow (id) {
  	const owner = 'owner1';
  	const priority = 0;
    let enforce = '';   

  	const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?workflowOwner=${owner}&priority=${priority}&enforcedPluginType=${enforce}`;    
    return this.http.post(url, JSON.stringify('{}')).map(data => {   
    	if (data) {
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
  getLogs(taskId, topologyName) {
    const topology = topologyName;
    const externalTaskId = taskId;
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
  */
  getAllExecutions(id, page?) {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
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
  */
  getAllFinishedExecutions(id, page?) {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;   
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
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowOwner=&orderField=CREATED_DATE&ascending=false`;   
    return this.http.get(url).map(data => {   
      if (data) {
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
  */
  getAllExecutionsPerOrganisation(page, ongoing?) {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?workflowOwner=&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;  
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get(url).map(data => {  
      if (data) {
        return data;
      } else {
        return false;
      }
    });
  }

  /** getCurrentPlugin
  /* get plugin that is currently running for a specific dataset/workflow
  /* in case there is no plugin running, return last plugin
  /* @param {object} workflow - workflow for specific dataset
  */
  getCurrentPlugin(workflow) {
    let currentPlugin = 0;
    for (let i = 0; i < workflow['metisPlugins'].length; i++) {
      currentPlugin = i;
      if (workflow['metisPlugins'][i].pluginStatus === 'INQUEUE' || workflow['metisPlugins'][i].pluginStatus === 'RUNNING') {
        break;
      }
    }
    return currentPlugin;
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
  getStatistics(topologyName?, taskId?) {
    const topology = topologyName ? topologyName : 'validation';
    const externalTaskId = taskId ? taskId : '8867430008884183469';
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/statistics`;   
    return this.http.get(url).map(data => {   
      if (data) {
        return data;
      } else {
        return false;
      }
    });
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
  selectWorkflow(): void {
    this.selectedWorkflow.emit(true);
  }

  /** workflowDone
  /*  indicate when workflow is done, and emit changes so other components can act upon
  /* @param {string} status - status of the workflow that just finished running
  */
  workflowDone(status): void {
    this.workflowIsDone.emit(status);
  }

  /** ongoingExecutionDone
  /*  when ongoing execution has finished, notify other components
  /* @param {boolean} status - status of the executions
  */
  ongoingExecutionDone(status): void {
    this.ongoingExecutionIsDone.emit(status);
  }
}
