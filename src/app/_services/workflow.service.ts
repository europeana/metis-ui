import { map, publishLast, switchMap } from 'rxjs/operators';
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { apiSettings } from '../../environments/apisettings';

import { ConnectableObservable, forkJoin, Observable, of } from 'rxjs';
import { ErrorService } from './error.service';
import { Workflow } from '../_models/workflow';
import { HarvestData } from '../_models/harvest-data';
import { WorkflowExecution } from '../_models/workflow-execution';
import { Report } from '../_models/report';
import { SubTaskInfo } from '../_models/subtask-info';
import { Results } from '../_models/results';
import { XmlSample } from '../_models/xml-sample';
import { Statistics } from '../_models/statistics';
import { DatasetsService } from './datasets.service';
import { LogStatus } from '../_models/log-status';

@Injectable()
export class WorkflowService {

  constructor(private http: HttpClient,
    private datasetService: DatasetsService,
    private errors: ErrorService) { }

  public startNewWorkflow: EventEmitter<void> = new EventEmitter<void>();
  public reloadWorkflowExecution: EventEmitter<void> = new EventEmitter();
  public promptCancelWorkflow: EventEmitter<string> = new EventEmitter();
  public updateLog: EventEmitter<LogStatus> = new EventEmitter();

  currentTaskId?: string;
  currentProcessing: { processed: number; topology: string };
  reportByKey: { [key: string]: Observable<Report> } = {};

  getWorkflowForDataset (id: string): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    return this.http.get<Workflow>(url).pipe(this.errors.handleRetry());
  }

  // get data about publication and harvest
  getPublishedHarvestedData(id: string): Observable<HarvestData> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/information`;
    return this.http.get<HarvestData>(url).pipe(this.errors.handleRetry());
  }

  //  create or override a workflow for specific dataset
  createWorkflowForDataset (id: string, values: Partial<Workflow>, newWorkflow: boolean): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    if (!newWorkflow) {
      return this.http.put<Workflow>(url, values).pipe(this.errors.handleRetry());
    } else {
      return this.http.post<Workflow>(url, values).pipe(this.errors.handleRetry());
    }
  }

  //  trigger a new workflow
  public startWorkflow (id: string): Observable<WorkflowExecution> {
    const priority = 0;
    const enforce = '';

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?priority=${priority}&enforcedPluginType=${enforce}`;
    return this.http.post<WorkflowExecution>(url, {}).pipe(this.errors.handleRetry());
  }

  //  get logging information using topology and externaltaskid
  getLogs(taskId?: string, topologyName?: string, start?: number, finish?: number): Observable<SubTaskInfo[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/logs?from=${start}&to=${finish}`;

    return this.http.get<SubTaskInfo[]>(url).pipe(this.errors.handleRetry());
  }

  getReport(taskId: string, topologyName: string): Observable<Report> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/report?idsPerError=100`;
    return this.http.get<Report>(url).pipe(this.errors.handleRetry());
  }

  // only use this for finished tasks
  getCachedReport(taskId: string, topologyName: string): Observable<Report> {
    const key = `${taskId}/${topologyName}`;
    let observable = this.reportByKey[key];
    if (observable) {
      return observable;
    }
    // tslint:disable-next-line: no-any
    observable = this.getReport(taskId, topologyName).pipe(publishLast());
    (observable as ConnectableObservable<Report>).connect();
    this.reportByKey[key] = observable;
    return observable;
  }

  //  get history of finished, failed or canceled executions for specific datasetid
  getCompletedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const api = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/`;
    const url = `${api}${id}?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  //  get history of executions for specific datasetid, every status
  getDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  //  get history of finished executions for specific datasetid
  getFinishedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution[]>> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  //  get most recent execution for specific datasetid
  getLastDatasetExecution(id: string): Observable<WorkflowExecution> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?&orderField=CREATED_DATE&ascending=false`;
    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(map(lastExecution => {
      return lastExecution.results[0];
    })).pipe(this.errors.handleRetry());
  }

  //  get all executions for the user's organisation, either ongoing or finished/failed
  protected getAllExecutions(page: number, ongoing?: boolean): Observable<Results<WorkflowExecution[]>> {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get<Results<WorkflowExecution[]>>(url).pipe(this.errors.handleRetry());
  }

  private collectAllResults<T>(
    getResults: (page: number) => Observable<Results<T[]>>,
    page: number
  ): Observable<T[]> {
    return getResults(page).pipe(
      switchMap(({ results, nextPage }) => {
        if (nextPage !== -1) {
          return this.collectAllResults(getResults, page + 1).pipe(
            map((nextResults) => results.concat(nextResults))
          );
        } else {
          return of(results);
        }
      })
    );
  }

  private collectResultsUptoPage<T>(
    getResults: (page: number) => Observable<Results<T[]>>,
    endPage: number
  ): Observable<T[]> {
    const observables: Observable<Results<T[]>>[] = [];
    for (let i = 0; i <= endPage; i ++) {
      observables.push(getResults(i));
    }
    return forkJoin(observables).pipe(
      map((resultList) => ([] as T[]).concat(...resultList.map(r => r.results)))
    );
  }

  private addDatasetNameAndCurrentPlugin(executions: WorkflowExecution[], currentDatasetId?: string): Observable<WorkflowExecution[]> {
    if (executions.length === 0) {
      return of(executions);
    }

    // TODO: extract this, call this from component after getting executions?
    executions.forEach((execution) => {
      execution.currentPlugin = this.getCurrentPlugin(execution);

      const thisPlugin = execution['metisPlugins'][execution.currentPlugin];

      if (execution.datasetId === currentDatasetId) {
        if (this.currentTaskId !== thisPlugin['externalTaskId']) {
          const message = {
            'externalTaskId' : thisPlugin['externalTaskId'],
            'topology' : thisPlugin['topologyName'],
            'plugin': thisPlugin['pluginType'],
            'processed': thisPlugin['executionProgress'].processedRecords,
            'status': thisPlugin['pluginStatus']
          };
          this.updateLog.emit(message);
        }
        this.setCurrentProcessed(thisPlugin['executionProgress'].processedRecords, thisPlugin['pluginType']);
        this.currentTaskId = thisPlugin['externalTaskId'];
      }
    });

    const observables = executions.map(({ datasetId }) => this.datasetService.getDataset(datasetId));
    return forkJoin(observables).pipe(
      map((datasets) => {
        executions.forEach((execution, i) => {
          execution.datasetName = datasets[i].datasetName;
        });
        return executions;
      })
    );

    // TODO: error handling?
  }

  getAllExecutionsCollectingPages(ongoing: boolean): Observable<WorkflowExecution[]> {
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return this.collectAllResults(getResults, 0).pipe(
      switchMap((executions => this.addDatasetNameAndCurrentPlugin(executions)))
    );
  }

  getAllExecutionsUptoPage(endPage: number, ongoing: boolean): Observable<WorkflowExecution[]> {
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return this.collectResultsUptoPage(getResults, endPage).pipe(
      switchMap((executions => this.addDatasetNameAndCurrentPlugin(executions)))
    );
  }

  // get plugin that is currently running for a specific dataset/workflow
  // in case there is no plugin running, return last plugin
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

  getReportsForExecution(workflowExecution: WorkflowExecution): void {
    workflowExecution.metisPlugins.forEach((pluginExecution) => {
      const { pluginStatus, externalTaskId, topologyName } = pluginExecution;
      if (pluginStatus === 'FINISHED' || pluginStatus === 'FAILED' || pluginStatus === 'CANCELLED') {
        if (externalTaskId && topologyName) {
          this.getCachedReport(externalTaskId, topologyName).subscribe(report => {
            if (report.errors.length) {
              pluginExecution.hasReport = true;
            }
          }, (err: HttpErrorResponse) => {
            this.errors.handleError(err);
          });
        }
      }
    });
  }

  // cancel the running execution for a datasetid
  cancelThisWorkflow(id: string): Observable<void> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}`;
    return this.http.delete<void>(url);
  }

  // show a prompt to cancel workflow
  promptCancelThisWorkflow(id: string): void {
    this.promptCancelWorkflow.emit(id);
  }

  // return samples based on executionid and plugintype
  getWorkflowSamples(executionId: string, pluginType: string): Observable<XmlSample[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;
    return this.http.get<{ records: XmlSample[] }>(url).pipe(map(samples => {
      return samples['records'];
    })).pipe(this.errors.handleRetry());
  }

  //  get statistics for a certain dataset
  getStatistics(topologyName: string, taskId: string): Observable<Statistics> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/statistics`;
    return this.http.get<Statistics>(url).pipe(this.errors.handleRetry());
  }

  // set information about the currently processing topology
  setCurrentProcessed(processed: number, topology: string): void {
    this.currentProcessing = {'processed': processed, 'topology': topology};
  }

  // get information about currently processing topology
  getCurrentProcessed(): { processed: number; topology: string } {
    return this.currentProcessing;
  }
}
