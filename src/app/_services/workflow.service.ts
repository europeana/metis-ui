
import {map, tap} from 'rxjs/operators';
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
  @Output() workflowIsDone: EventEmitter<boolean> = new EventEmitter();
  @Output() updateHistoryPanel: EventEmitter<WorkflowExecution> = new EventEmitter();
  @Output() promptCancelWorkflow: EventEmitter<string | false> = new EventEmitter();
  @Output() workflowCancelled: EventEmitter<boolean> = new EventEmitter();

  activeWorkflow?: WorkflowExecution;
  currentReport: Report;
  activeExternalTaskId: string;
  allWorkflows: WorkflowExecution[];
  currentPage: { [component: string]: number } = {};
  currentProcessing: { processed: number; topology: string };

  /** getWorkflowForDataset
  /*  check if there is a workflow for this specific dataset
  /* @param {string} id - dataset identifier
  */
  getWorkflowForDataset (id: string): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    return this.http.get<Workflow>(url).pipe(this.errors.handleRetry());
  }

  /** getPublishedHarvestedData
  /*  get data about publication and harvest
  /* @param {string} id - dataset identifier
  */
  getPublishedHarvestedData(id: string): Observable<HarvestData> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/information`;
    return this.http.get<HarvestData>(url).pipe(this.errors.handleRetry());
  }

  /** createWorkflowForDataset
  /*  create or override a workflow for specific dataset
  /* @param {string} id - dataset identifier
  /* @param {object} values - form values
  /* @param {boolean} newWorkflow - is this a new workflow or one to update
  */
  createWorkflowForDataset (id: string, values: Partial<Workflow>, newWorkflow: boolean): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    if (newWorkflow === false) {
      return this.http.put<Workflow>(url, values).pipe(this.errors.handleRetry());
    } else {
      return this.http.post<Workflow>(url, values).pipe(this.errors.handleRetry());
    }
  }

  /** triggerNewWorkflow
  /*  trigger a new workflow
  /* @param {string} id - dataset identifier
  */
  public triggerNewWorkflow (id: string): Observable<WorkflowExecution> {
    const priority = 0;
    const enforce = '';

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?priority=${priority}&enforcedPluginType=${enforce}`;
    return this.http.post<WorkflowExecution>(url, JSON.stringify('{}')).pipe(this.errors.handleRetry());
  }

  /** getLogs
  /*  get logging information using topology and externaltaskid
  /* @param {number} taskId - identifier of task, optional
  /* @param {string} topologyName - name of the topology, optional
  /* @param {number} start - start from ...
  /* @param {number} finish - to ...
  */
  getLogs(taskId?: string, topologyName?: string, start?: number, finish?: number): Observable<SubTaskInfo[]> {
    const topology = topologyName;
    const externalTaskId = taskId;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/logs?from=${start}&to=${finish}`;

    return this.http.get<SubTaskInfo[]>(url).pipe(this.errors.handleRetry());
  }

  /** getReport
  /*  get report information using topology and externaltaskid
  /* @param {number} taskId - identifier of task
  /* @param {string} topologyName - name of the topology
  */
  getReport(taskId: string | undefined, topologyName: string): Observable<Report> {
    const topology = topologyName;
    const externalTaskId = taskId;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topology}/task/${externalTaskId}/report?idsPerError=100`;
    return this.http.get<Report>(url).pipe(this.errors.handleRetry());
  }

  /** getAllExecutions
  /*  get history of executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const api = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/`;
    const url = `${api}${id}?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    console.log('getAllExecutions', url);
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(tap(allExecutions => {
      this.allWorkflows = allExecutions.results;
    })).pipe(this.errors.handleRetry());
  }

  /** getAllExecutionsEveryStatus
  /*  get history of executions for specific datasetid, every status
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllExecutionsEveryStatus(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  /** getAllFinishedExecutions
  /*  get history of finished executions for specific datasetid, possible to retrieve results for a specific page
  /* @param {string} id - identifier of dataset
  /* @param {number} page - number of next page, optional
  */
  getAllFinishedExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  /** getLastExecution
  /*  get most recent execution for specific datasetid
  /* @param {string} id - identifier of dataset
  */
  getLastExecution(id: string): Observable<WorkflowExecution> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?&orderField=CREATED_DATE&ascending=false`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(map(lastExecution => {
      return lastExecution.results[0];
    })).pipe(this.errors.handleRetry());
  }

  /** getOngoingExecutionsPerOrganisation
  /*  get all ongoing (either running or inqueue) executions for the user's organisation
  /* @param {number} page - number of next page
  /* @param {boolean} ongoing - ongoing executions only, optional
  */
  getAllExecutionsPerOrganisation(page: number, ongoing?: boolean): Observable<Results<WorkflowExecution[]>> {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
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
  cancelThisWorkflow(id: string): Observable<void> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}`;
    return this.http.delete<void>(url);
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
  getWorkflowSamples(executionId: string, pluginType: string): Observable<XmlSample[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;
    return this.http.get<{ records: XmlSample[] }>(url).pipe(map(samples => {
      return samples['records'];
    })).pipe(this.errors.handleRetry());
  }

  /** getStatistics
  /*  get statistics for a certain dataset
  /* mocked data for now
  */

  getStatistics(topologyName: string, taskId: string): Observable<Statistics> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/statistics`;
    return this.http.get<Statistics>(url).pipe(this.errors.handleRetry());
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
  setCurrentProcessed(processed: number, topology: string): void {
    this.currentProcessing = {'processed': processed, 'topology': topology};
  }

  /** getCurrentProcessed
  /* get information about currently processing topology
  */
  getCurrentProcessed(): { processed: number; topology: string } {
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
  /* @param {boolean} done - is the workflow done
  */
  workflowDone(done: boolean): void {
    this.workflowIsDone.emit(done);
  }

  /** updateHistory
  /*  update history in the collapsible panel after finishing a task/plugin
  /* @param {object} workflow - status of current workflow
  */
  updateHistory(workflow: WorkflowExecution): void {
    this.updateHistoryPanel.emit(workflow);
  }
}
