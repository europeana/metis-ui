
import {map} from 'rxjs/operators';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { Observable ,  of } from 'rxjs';
import { ErrorService } from './error.service';
import { Workflow } from '../_models/workflow';
import { HarvestData } from '../_models/harvest-data';
import { WorkflowExecution } from '../_models/workflow-execution';
import { Report } from '../_models/report';
import { SubTaskInfo } from '../_models/subtask-info';
import { Results } from '../_models/results';
import { XmlSample } from '../_models/xml-sample';
import { Statistics } from '../_models/statistics';

@Injectable()
export class WorkflowService {

  constructor(private http: HttpClient,
    private errors: ErrorService) { }

  @Output() changeWorkflow: EventEmitter<WorkflowExecution> = new EventEmitter();
  @Output() selectedWorkflow: EventEmitter<boolean> = new EventEmitter();
  @Output() workflowIsDone: EventEmitter<string> = new EventEmitter();
  @Output() updateHistoryPanel: EventEmitter<Workflow> = new EventEmitter();
  @Output() promptCancelWorkflow: EventEmitter<string | false> = new EventEmitter();
  @Output() workflowCancelled: EventEmitter<boolean> = new EventEmitter();

  activeWorkflow?: WorkflowExecution;
  currentReport: Report;
  activeExternalTaskId: string;
  allWorkflows: WorkflowExecution[];
  currentPage: { [component: string]: number } = {};
  currentProcessing: { processed: string; topology: string };

  /** getWorkflowForDataset
  /*  check if there is a workflow for this specific dataset
  /* @param {string} id - dataset identifier
  */
  getWorkflowForDataset (id: string): Observable<Workflow | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    return this.http.get<Workflow | null>(url).pipe(map(workflowData => {
      return workflowData ? workflowData : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getPublishedHarvestedData
  /*  get data about publication and harvest
  /* @param {string} id - dataset identifier
  */
  getPublishedHarvestedData(id: string): Observable<HarvestData | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/information`;
    return this.http.get<HarvestData | null>(url).pipe(map(harvestedData => {
      return harvestedData ? harvestedData : false;
    })).pipe(this.errors.handleRetry());
  }

  /** createWorkflowForDataset
  /*  create or override a workflow for specific dataset
  /* @param {string} id - dataset identifier
  /* @param {object} values - form values
  /* @param {boolean} newWorkflow - is this a new workflow or one to update
  */
  createWorkflowForDataset (id: string, values: Workflow, newWorkflow: boolean): Observable<Workflow | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    if (newWorkflow === false) {
      return this.http.put<Workflow | null>(url, values).pipe(map(newWorkflowData => {
        return newWorkflowData ? newWorkflowData : false;
      })).pipe(this.errors.handleRetry());
    } else {
      return this.http.post<Workflow | null>(url, values).pipe(map(updatedWorkflowData => {
        return updatedWorkflowData ? updatedWorkflowData : false;
      })).pipe(this.errors.handleRetry());
    }
  }

  /** triggerNewWorkflow
  /*  trigger a new workflow
  /* @param {string} id - dataset identifier
  */
  public triggerNewWorkflow (id: string): Observable<WorkflowExecution | false> {
    const priority = 0;
    const enforce = '';

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?priority=${priority}&enforcedPluginType=${enforce}`;
    return this.http.post<WorkflowExecution | null>(url, JSON.stringify('{}')).pipe(map(newWorkflowExecution => {
      return newWorkflowExecution ? newWorkflowExecution : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getLogs
  /*  get logging information using topology and externaltaskid
  /* @param {number} taskId - identifier of task, optional
  /* @param {string} topologyName - name of the topology, optional
  /* @param {number} start - start from ...
  /* @param {number} finish - to ...
  */
  getLogs(taskId?: number, topologyName?: string, start?: number, finish?: number): Observable<SubTaskInfo[] | false> {
    const topology = topologyName;
    const externalTaskId = taskId;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/logs?from=${start}&to=${finish}`;

    return this.http.get<SubTaskInfo[] | null>(url).pipe(map(logData => {
      return logData ? logData : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getReport
  /*  get report information using topology and externaltaskid
  /* @param {number} taskId - identifier of task
  /* @param {string} topologyName - name of the topology
  */
  getReport(taskId: string, topologyName: string): Observable<Report | false> {
    const topology = topologyName;
    const externalTaskId = taskId;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/report?idsPerError=100`;
    return this.http.get<Report | null>(url).pipe(map(reportData => {
      return reportData ? reportData : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getAllExecutions
  /*  get history of executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]> | false> {
    const api = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/`;
    const url = `${api}${id}?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    console.log('getAllExecutions', url);
    return this.http.get<Results<WorkflowExecution[]> | null>(url).pipe(map(allExecutions => {
      if (allExecutions) {
        this.allWorkflows = allExecutions.results;
        return allExecutions;
      } else {
        return false;
      }
    })).pipe(this.errors.handleRetry());
  }

  /** getAllExecutionsEveryStatus
  /*  get history of executions for specific datasetid, every status
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllExecutionsEveryStatus(id: string, page?: number): Observable<Results<WorkflowExecution[]> | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]> | null>(url).pipe(map(allExecutionsStatus => {
      if (allExecutionsStatus) {
        return allExecutionsStatus;
      } else {
        return false;
      }
    })).pipe(this.errors.handleRetry());
  }

  /** getAllFinishedExecutions
  /*  get history of finished executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllFinishedExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]> | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]> | null>(url).pipe(map(finishedExecutions => {
      return finishedExecutions ? finishedExecutions : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getLastExecution
  /*  get most recent execution for specific datasetid
  /* @param {string} id - identifier of dataset
  */
  getLastExecution(id: string): Observable<WorkflowExecution | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?&orderField=CREATED_DATE&ascending=false`;
    return this.http.get<Results<WorkflowExecution[]> | null>(url).pipe(map(lastExecution => {
      return lastExecution ? lastExecution.results[0] : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getOngoingExecutionsPerOrganisation
  /*  get all ongoing (either running or inqueue) executions for the user's organisation
  /* @param {number} page - number of next page
  /* @param {boolean} ongoing - ongoing executions only, optional
  */
  getAllExecutionsPerOrganisation(page: number, ongoing?: boolean): Observable<Results<WorkflowExecution[]> | false> {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get<Results<WorkflowExecution[]> | null>(url).pipe(map(executionsOrganisation => {
      return executionsOrganisation ? executionsOrganisation : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getCurrentPlugin
  /* get plugin that is currently running for a specific dataset/workflow
  /* in case there is no plugin running, return last plugin
  /* @param {object} workflow - workflow for specific dataset
  */
  getCurrentPlugin(workflow: WorkflowExecution): number {
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
  cancelThisWorkflow(id: string): Observable<void | boolean> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}`;
    return this.http.delete<boolean>(url).pipe(map(canceledWorkflow => {
      return canceledWorkflow ? canceledWorkflow : false;
    }));
  }

  /** promptCancelThisWorkflow
  /* show a prompt to cancel workflow
  /* @param {number} id - id of the workflow
  */
  promptCancelThisWorkflow(id: string | false): void {
    if (!id) { id = false; }
    this.promptCancelWorkflow.emit(id);
  }

  /** setWorkflowCancelled
  /* set cancelled to true
  */
  setWorkflowCancelled(): void {
    this.workflowCancelled.emit(true);
  }

  /** getWorkflowSamples
  /* return samples based on executionid and plugintype
  /* @param {number} executionId - id of the execution
  /* @param {string} pluginType - name of the plugin
  */
  getWorkflowSamples(executionId: string, pluginType: string): Observable<XmlSample[] | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;
    return this.http.get<{ records: XmlSample[] } | null>(url).pipe(map(samples => {
      return samples ? samples['records'] : false;
    })).pipe(this.errors.handleRetry());
  }

  /** getStatistics
  /*  get statistics for a certain dataset
  /* mocked data for now
  */

  getStatistics(topologyName: string, taskId: string): Observable<Statistics | false> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/statistics`;
    return this.http.get<Statistics | null>(url).pipe(map(statistics => {
      return statistics ? statistics : false;
    })).pipe(this.errors.handleRetry());
  }

  /** setCurrentReport
  /* set content for selected report
  /* @param {object} report - data of current report
  */
  setCurrentReport(report: Report ): void {
    this.currentReport = report;
  }

  /** getCurrentReport
  /* get content for selected report
  */
  getCurrentReport(): Report {
    return this.currentReport;
  }

  /** setCurrentReport
  /* set information about the currently processing topology
  /* @param {object} report - data of current report
  */
  setCurrentProcessed(processed: string, topology: string): void {
    this.currentProcessing = {'processed': processed, 'topology': topology};
  }

  /** getCurrentProcessed
  /* get information about currently processing topology
  */
  getCurrentProcessed(): { processed: string; topology: string } {
    return this.currentProcessing;
  }

  /** setCurrentPageNumberForComponent
  /*  set currentpage to current page number
  /*  for a specific component
  /*  a page is a new set of results (pagination for list/table of results)
  /* @param {number} page - number of the current page
  /* @param {string} component - for this specific component
  */
  setCurrentPageNumberForComponent(page: number, component: string): void {
    this.currentPage[component] = page;
  }

  /** getCurrentPageNumberForComponent
  /*  get the current page number for the specific component
  /* @param {string} component - for this specific component
  */
  getCurrentPageNumberForComponent(component: string): number {
    return this.currentPage[component];
  }

  /** setActiveWorkflow
  /*  set active workflow and emit changes so other components can act upon
  /* @param {string} workflow - name of the workflow that is currenty running/active
  */
  setActiveWorkflow(workflow?: WorkflowExecution): void {
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
  workflowDone(status: string): void {
    this.workflowIsDone.emit(status);
  }

  /** updateHistory
  /*  update history in the collapsible panel after finishing a task/plugin
  /* @param {any} workflow - status of current workflow
  */
  updateHistory(workflow: Workflow): void {
    this.updateHistoryPanel.emit(workflow);
  }
}
