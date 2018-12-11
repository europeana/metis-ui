import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { ConnectableObservable, forkJoin, Observable, of } from 'rxjs';
import { map, publishLast, switchMap, tap } from 'rxjs/operators';

import { apiSettings } from '../../environments/apisettings';
import {
  HarvestData,
  MoreResults,
  Report,
  Results,
  Statistics,
  SubTaskInfo,
  Workflow,
  WorkflowExecution,
  XmlSample,
} from '../_models';

import { DatasetsService } from './datasets.service';
import { ErrorService } from './error.service';

@Injectable()
export class WorkflowService {
  constructor(
    private http: HttpClient,
    private datasetService: DatasetsService,
    private errors: ErrorService,
  ) {}

  public promptCancelWorkflow: EventEmitter<string> = new EventEmitter();

  reportByKey: { [key: string]: Observable<Report> } = {};

  private collectAllResults<T>(
    getResults: (page: number) => Observable<Results<T>>,
    page: number,
  ): Observable<T[]> {
    return getResults(page).pipe(
      switchMap(({ results, nextPage }) => {
        if (nextPage !== -1) {
          return this.collectAllResults(getResults, page + 1).pipe(
            map((nextResults) => results.concat(nextResults)),
          );
        } else {
          return of(results);
        }
      }),
    );
  }

  private collectResultsUptoPage<T>(
    getResults: (page: number) => Observable<Results<T>>,
    endPage: number,
  ): Observable<MoreResults<T>> {
    const observables: Observable<Results<T>>[] = [];
    for (let i = 0; i <= endPage; i++) {
      observables.push(getResults(i));
    }
    return forkJoin(observables).pipe(
      map((resultList) => {
        const results = ([] as T[]).concat(...resultList.map((r) => r.results));
        const lastResult = resultList[resultList.length - 1];
        const more = lastResult.nextPage >= 0;
        return { results, more };
      }),
    );
  }

  getWorkflowForDataset(id: string): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    return this.http.get<Workflow>(url).pipe(this.errors.handleRetry());
  }

  // get data about publication and harvest
  getPublishedHarvestedData(id: string): Observable<HarvestData> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/executions/dataset/${id}/information`;
    return this.http.get<HarvestData>(url).pipe(this.errors.handleRetry());
  }

  //  create or override a workflow for specific dataset
  createWorkflowForDataset(
    id: string,
    values: Partial<Workflow>,
    newWorkflow: boolean,
  ): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    if (!newWorkflow) {
      return this.http.put<Workflow>(url, values).pipe(this.errors.handleRetry());
    } else {
      return this.http.post<Workflow>(url, values).pipe(this.errors.handleRetry());
    }
  }

  //  trigger a new workflow
  public startWorkflow(id: string): Observable<WorkflowExecution> {
    const priority = 0;
    const enforce = '';

    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/${id}/execute?priority=${priority}&enforcedPluginType=${enforce}`;
    return this.http.post<WorkflowExecution>(url, {}).pipe(this.errors.handleRetry());
  }

  //  get logging information using topology and externaltaskid
  getLogs(
    taskId?: string,
    topologyName?: string,
    start?: number,
    finish?: number,
  ): Observable<SubTaskInfo[]> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/proxies/${topologyName}/task/${taskId}/logs?from=${start}&to=${finish}`;

    return this.http.get<SubTaskInfo[]>(url).pipe(this.errors.handleRetry());
  }

  getReport(taskId: string, topologyName: string): Observable<Report> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/proxies/${topologyName}/task/${taskId}/report?idsPerError=100`;
    return this.http.get<Report>(url).pipe(this.errors.handleRetry());
  }

  // only use this for finished tasks
  getCachedReport(taskId: string, topologyName: string): Observable<Report> {
    const key = `${taskId}/${topologyName}`;
    let observable = this.reportByKey[key];
    if (observable) {
      return observable;
    }
    observable = this.getReport(taskId, topologyName).pipe(
      tap(undefined, () => {
        delete this.reportByKey[key];
      }),
      publishLast(),
    );
    (observable as ConnectableObservable<Report>).connect();
    this.reportByKey[key] = observable;
    return observable;
  }

  //  get history of finished, failed or canceled executions for specific datasetid
  getCompletedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution>> {
    const api = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/`;
    // tslint:disable-next-line: max-line-length
    const url = `${api}${id}?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution>>(url).pipe(this.errors.handleRetry());
  }

  getCompletedDatasetExecutionsUptoPage(
    id: string,
    endPage: number,
  ): Observable<MoreResults<WorkflowExecution>> {
    const getResults = (page: number) => this.getCompletedDatasetExecutions(id, page);
    return this.collectResultsUptoPage(getResults, endPage);
  }

  //  get history of executions for specific datasetid, every status
  getDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution>> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/executions/dataset/${id}?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution>>(url).pipe(this.errors.handleRetry());
  }

  getDatasetExecutionsCollectingPages(id: string): Observable<WorkflowExecution[]> {
    const getResults = (page: number) => this.getDatasetExecutions(id, page);
    return this.collectAllResults(getResults, 0).pipe(
      switchMap((executions) => this.addDatasetNameAndCurrentPlugin(executions)),
    );
  }

  //  get history of finished executions for specific datasetid
  getFinishedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution>> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/executions/dataset/${id}?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution>>(url).pipe(this.errors.handleRetry());
  }

  //  get most recent execution for specific datasetid
  getLastDatasetExecution(id: string): Observable<WorkflowExecution | undefined> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/executions/dataset/${id}?&orderField=CREATED_DATE&ascending=false`;
    return this.http
      .get<Results<WorkflowExecution>>(url)
      .pipe(
        map((lastExecution) => {
          return lastExecution.results[0];
        }),
      )
      .pipe(this.errors.handleRetry());
  }

  //  get all executions for the user's organisation, either ongoing or finished/failed
  protected getAllExecutions(
    page: number,
    ongoing?: boolean,
  ): Observable<Results<WorkflowExecution>> {
    let url = `${
      apiSettings.apiHostCore
    }/orchestrator/workflows/executions/?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get<Results<WorkflowExecution>>(url).pipe(this.errors.handleRetry());
  }

  private addDatasetNameAndCurrentPlugin(
    executions: WorkflowExecution[],
  ): Observable<WorkflowExecution[]> {
    if (executions.length === 0) {
      return of(executions);
    }

    executions.forEach((execution) => {
      execution.currentPlugin = this.getCurrentPlugin(execution);
    });

    const observables = executions.map(({ datasetId }) =>
      this.datasetService.getDataset(datasetId),
    );
    return forkJoin(observables).pipe(
      map((datasets) => {
        executions.forEach((execution, i) => {
          execution.datasetName = datasets[i].datasetName;
        });
        return executions;
      }),
    );

    // TODO: error handling?
  }

  getAllExecutionsCollectingPages(ongoing: boolean): Observable<WorkflowExecution[]> {
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return this.collectAllResults(getResults, 0).pipe(
      switchMap((executions) => this.addDatasetNameAndCurrentPlugin(executions)),
    );
  }

  getAllExecutionsUptoPage(
    endPage: number,
    ongoing: boolean,
  ): Observable<MoreResults<WorkflowExecution>> {
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return this.collectResultsUptoPage(getResults, endPage).pipe(
      switchMap(({ results, more }) =>
        this.addDatasetNameAndCurrentPlugin(results).pipe(map((r2) => ({ results: r2, more }))),
      ),
    );
  }

  // get plugin that is currently running for a specific dataset/workflow
  // in case there is no plugin running, return last plugin
  getCurrentPlugin(workflow: WorkflowExecution): number {
    let currentPlugin = 0;
    for (let i = 0; i < workflow.metisPlugins.length; i++) {
      currentPlugin = i;
      if (
        workflow.metisPlugins[i].pluginStatus === 'INQUEUE' ||
        workflow.metisPlugins[i].pluginStatus === 'RUNNING'
      ) {
        break;
      }
    }
    return currentPlugin;
  }

  getReportsForExecution(workflowExecution: WorkflowExecution): void {
    workflowExecution.metisPlugins.forEach((pluginExecution) => {
      const { pluginStatus, externalTaskId, topologyName } = pluginExecution;
      if (
        pluginStatus === 'FINISHED' ||
        pluginStatus === 'FAILED' ||
        pluginStatus === 'CANCELLED'
      ) {
        if (externalTaskId && topologyName) {
          this.getCachedReport(externalTaskId, topologyName).subscribe(
            (report) => {
              if (report.errors.length) {
                pluginExecution.hasReport = true;
              }
            },
            (err: HttpErrorResponse) => {
              this.errors.handleError(err);
            },
          );
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
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;
    return this.http
      .get<{ records: XmlSample[] }>(url)
      .pipe(
        map((samples) => {
          return samples.records;
        }),
      )
      .pipe(this.errors.handleRetry());
  }

  //  get statistics for a certain dataset
  getStatistics(topologyName: string, taskId: string): Observable<Statistics> {
    const url = `${
      apiSettings.apiHostCore
    }/orchestrator/proxies/${topologyName}/task/${taskId}/statistics`;
    return this.http.get<Statistics>(url).pipe(this.errors.handleRetry());
  }
}
