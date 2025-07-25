import { HttpClient } from '@angular/common/http';
import { EventEmitter, inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { KeyedCache, SubscriptionManager } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  CancellationRequest,
  DatasetOverview,
  getCurrentPlugin,
  getCurrentPluginIndex,
  HarvestData,
  HistoryVersion,
  HistoryVersions,
  IncrementalHarvestingAllowedResult,
  isPluginCompleted,
  MoreResults,
  NodePathStatistics,
  PluginAvailabilityList,
  PluginType,
  Report,
  ReportAvailability,
  Results,
  Statistics,
  SubTaskInfo,
  TopologyName,
  Workflow,
  WorkflowExecution,
  WorkflowExecutionHistoryList,
  XmlSample
} from '../_models';
import { DatasetsService } from './datasets.service';
import { collectResultsUptoPage, paginatedResult } from './service-utils';

@Injectable({ providedIn: 'root' })
export class WorkflowService extends SubscriptionManager {
  private readonly http = inject(HttpClient);
  private readonly datasetsService = inject(DatasetsService);

  public promptCancelWorkflow: EventEmitter<CancellationRequest> = new EventEmitter();

  hasErrorsCache = new KeyedCache((key) => this.requestHasError(key));

  static readonly userLookupDisabled = 'user lookup disabled';
  static readonly userUnknown = 'unknown';

  private collectAllResults<T>(
    getResults: (page: number) => Observable<Results<T>>,
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

  /** collectAllResultsUptoPage
  /* generic pagination utility
  */
  private collectAllResultsUptoPage<T>(
    getResults: (page: number) => Observable<Results<T>>,
    endPage: number
  ): Observable<MoreResults<T>> {
    const observables: Observable<Results<T>>[] = [];
    observables.push(getResults(endPage));
    return paginatedResult(observables);
  }

  /** getWorkflowForDataset
  /* get the workflow specified by the id
  */
  getWorkflowForDataset(id: string): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    return this.http.get<Workflow>(url);
  }

  /** getPublishedHarvestedData
  /* get data about publication and harvest
  */
  getPublishedHarvestedData(id: string): Observable<HarvestData> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/information`;
    return this.http.get<HarvestData>(url);
  }

  /** createWorkflowForDataset
  /* create or override a workflow for specific dataset
  */
  createWorkflowForDataset(
    id: string,
    values: Partial<Workflow>,
    newWorkflow: boolean
  ): Observable<Workflow> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}`;
    if (!newWorkflow) {
      return this.http.put<Workflow>(url, values);
    } else {
      return this.http.post<Workflow>(url, values);
    }
  }

  /** startWorkflow
  /* start the workflow with the specified id
  */
  public startWorkflow(id: string): Observable<WorkflowExecution> {
    const priority = 0;
    const enforce = '';

    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/${id}/execute?priority=${priority}&enforcedPluginType=${enforce}`;
    return this.http.post<WorkflowExecution>(url, {});
  }

  /** getLogs
  /* get logging information using topology and externaltaskid
  */
  getLogs(
    taskId?: string,
    topologyName?: TopologyName,
    start?: number,
    finish?: number
  ): Observable<SubTaskInfo[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/logs?from=${start}&to=${finish}`;

    return this.http.get<SubTaskInfo[]>(url);
  }

  /** getReportAvailable
  /* get report availability for the given id and topology name
  */
  getReportAvailable(taskId: string, topologyName: TopologyName): Observable<ReportAvailability> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/report/exists`;
    return this.http.get<ReportAvailability>(url);
  }

  /** getReport
  /* get the report for the given id and topology name
  */
  getReport(taskId: string, topologyName: TopologyName): Observable<Report> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/report?idsPerError=100`;
    return this.http.get<Report>(url);
  }

  requestHasError(key: string): Observable<boolean> {
    const [taskId, topologyName] = key.split('/');
    return this.getReportAvailable(taskId, topologyName as TopologyName).pipe(
      map((res) => {
        return res.existsExternalTaskReport;
      })
    );
  }

  getCachedHasErrors(
    taskId: string,
    topologyName: TopologyName,
    pluginIsCompleted: boolean
  ): Observable<boolean> {
    const key = `${taskId}/${topologyName}/${pluginIsCompleted}`;
    if (pluginIsCompleted) {
      return this.hasErrorsCache.get(key);
    } else {
      return this.hasErrorsCache.peek(key).pipe(
        switchMap((value) => {
          if (value) {
            return of(value);
          } else {
            return this.hasErrorsCache.get(key, true);
          }
        })
      );
    }
  }

  /**
   * getIsIncrementalHarvestAllowed
   * gets the incremental harvest availability (mapped to a boolean)
   * @param { string } - id - the id of the dataset to check
   * @returns ( Observable<boolean> )
   **/
  getIsIncrementalHarvestAllowed(id: string): Observable<boolean> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/allowed_incremental`;
    return this.http.get<IncrementalHarvestingAllowedResult>(url).pipe(
      switchMap((result: IncrementalHarvestingAllowedResult) => {
        return of(result.incrementalHarvestingAllowed);
      })
    );
  }

  /** getCompletedDatasetExecutions
  /* get history of finished, failed or canceled executions for specific datasetid
  */
  getCompletedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution>> {
    const api = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/`;
    // eslint-disable-next-line max-len
    const url = `${api}${id}?workflowStatus=FINISHED&workflowStatus=FAILED&workflowStatus=CANCELLED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution>>(url);
  }

  /** getCompletedDatasetExecutionsUptoPage
  /* get history of completed executions (paginated) up to page
  */
  getCompletedDatasetExecutionsUptoPage(
    id: string,
    endPage: number
  ): Observable<MoreResults<WorkflowExecution>> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.getCompletedDatasetExecutions(id, page);
    return collectResultsUptoPage(getResults, endPage);
  }

  /** getDatasetHistory
  /* get history of execution date data
  */
  getDatasetHistory(id: string): Observable<WorkflowExecutionHistoryList> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}/history`;
    return this.http.get<WorkflowExecutionHistoryList>(url);
  }

  /** getExecutionPlugins
  /* get history of plugin successes
  */
  getExecutionPlugins(id: string): Observable<PluginAvailabilityList> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}/plugins/data-availability`;
    return this.http.get<PluginAvailabilityList>(url);
  }

  /** getFinishedDatasetExecutions
  /* get history of finished executions for specific datasetid
  */
  getFinishedDatasetExecutions(id: string, page?: number): Observable<Results<WorkflowExecution>> {
    const url =
      `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}` +
      `?workflowStatus=FINISHED&orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    return this.http.get<Results<WorkflowExecution>>(url);
  }

  /** getLastDatasetExecution
  /* get most recent execution for specific datasetid
  */
  getLastDatasetExecution(id: string): Observable<WorkflowExecution | undefined> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/dataset/${id}?orderField=CREATED_DATE&ascending=false`;
    return this.http.get<Results<WorkflowExecution>>(url).pipe(
      map((lastExecution) => {
        return lastExecution.results[0];
      })
    );
  }

  /** getAllExecutions
  /* get all executions for the user's organisation, either ongoing or finished/failed
  */
  protected getAllExecutions(
    page: number,
    ongoing = false
  ): Observable<Results<WorkflowExecution>> {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions?orderField=CREATED_DATE&ascending=false&nextPage=${page}`;
    if (ongoing) {
      url += '&workflowStatus=INQUEUE&workflowStatus=RUNNING';
    } else {
      url += '&workflowStatus=CANCELLED&workflowStatus=FAILED&workflowStatus=FINISHED';
    }

    return this.http.get<Results<WorkflowExecution>>(url);
  }

  /** getCompletedDatasetSummaries
  /* get summary / overview for all executions
  */
  getCompletedDatasetSummaries(
    page?: number,
    params?: string
  ): Observable<Results<DatasetOverview>> {
    let url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/overview?`;

    if (page && page > 0) {
      url += `pageCount=${page + 1}&nextPage=0`;
    } else {
      url += `nextPage=${page}`;
    }
    url += params ?? '';
    return this.http.get<Results<DatasetOverview>>(url);
  }

  getCompletedDatasetOverviewsUptoPage(
    endPage: number,
    params?: string
  ): Observable<MoreResults<DatasetOverview>> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.getCompletedDatasetSummaries(page, params);
    return this.collectAllResultsUptoPage(getResults, endPage);
  }

  addDatasetNameAndCurrentPlugin(executions: WorkflowExecution[]): Observable<WorkflowExecution[]> {
    if (executions.length === 0) {
      return of(executions);
    }
    executions.forEach((execution) => {
      execution.currentPlugin = getCurrentPlugin(execution);
      execution.currentPluginIndex = getCurrentPluginIndex(execution);
    });

    const observables = executions.map(({ datasetId }) =>
      this.datasetsService.getDataset(datasetId)
    );
    return forkJoin(observables).pipe(
      map((datasets) => {
        executions.forEach((execution, i) => {
          execution.datasetName = datasets[i].datasetName;
        });
        return executions;
      })
    );
  }

  getAllExecutionsCollectingPages(ongoing: boolean): Observable<WorkflowExecution[]> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return this.collectAllResults(getResults, 0).pipe(
      switchMap((executions) => this.addDatasetNameAndCurrentPlugin(executions))
    );
  }

  getAllExecutionsUptoPage(
    endPage: number,
    ongoing: boolean
  ): Observable<MoreResults<WorkflowExecution>> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getResults = (page: number) => this.getAllExecutions(page, ongoing);
    return collectResultsUptoPage(getResults, endPage).pipe(
      switchMap(({ results, more }) =>
        this.addDatasetNameAndCurrentPlugin(results).pipe(map((r2) => ({ results: r2, more })))
      )
    );
  }

  getReportsForExecution(workflowExecution: WorkflowExecution): void {
    workflowExecution.metisPlugins.forEach((pluginExecution) => {
      const { externalTaskId, topologyName } = pluginExecution;
      if (externalTaskId && topologyName) {
        this.subs.push(
          this.getCachedHasErrors(
            externalTaskId,
            topologyName,
            isPluginCompleted(pluginExecution)
          ).subscribe((hasErrors) => {
            pluginExecution.hasReport = hasErrors;
          })
        );
      }
    });
  }

  // cancel the running execution for a datasetid
  cancelThisWorkflow(id: string): Observable<void> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/executions/${id}`;
    return this.http.delete<void>(url);
  }

  // show a prompt to cancel workflow
  promptCancelThisWorkflow(
    workflowExecutionId: string,
    datasetId: string,
    datasetName: string
  ): void {
    this.promptCancelWorkflow.emit({ workflowExecutionId, datasetId, datasetName });
  }

  // return samples based on executionid and plugintype
  getWorkflowSamples(executionId: string, pluginType: PluginType): Observable<XmlSample[]> {
    // eslint-disable-next-line max-len
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/records?workflowExecutionId=${executionId}&pluginType=${pluginType}&nextPage=`;
    return this.http.get<{ records: XmlSample[] }>(url).pipe(
      map((samples) => {
        return samples.records;
      })
    );
  }

  /** getRecordFromPredecessor
   *  return samples based on executionid and plugintype
   * @param { string } executionId
   * @param { PluginType } pluginType
   * @param { Array<string> } ids
   **/
  getRecordFromPredecessor(
    executionId: string,
    pluginType: PluginType,
    ids: Array<string>
  ): Observable<XmlSample[]> {
    const params = `?workflowExecutionId=${executionId}&pluginType=${pluginType}`;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/recordfrompredecessorplugin${params}`;

    return this.http
      .post<{ records: XmlSample[] }>(url, { ids })
      .pipe(
        map((samples) => {
          return samples.records;
        })
      );
  }

  /** searchWorkflowRecordsById
   * return XmlSample based on executionid, plugintype and idToSearch
   *
   * @param { string } executionId - the workflow execution id
   * @param { PluginType } pluginType - the plugin type
   * @param { string } idToSearch - the record to get
   *
   * @returns Observable<XmlSample>
   **/
  searchWorkflowRecordsById(
    executionId: string,
    pluginType: PluginType,
    idToSearch: string
  ): Observable<XmlSample> {
    const params = `?workflowExecutionId=${executionId}&pluginType=${pluginType}&idToSearch=${idToSearch}`;
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/recordsearchbyid${params}`;
    return this.http.post<XmlSample>(url, null);
  }

  /** getWorkflowRecordsById
   * return samples based on executionid, plugintype and ecloudIds
   *
   * @param { string } executionId - the workflow execution id
   * @param { PluginType } pluginType - the plugin type
   * @param { Array<string> } ids - the records to include
   *
   * @returns Observable<XmlSample[]>
   **/
  getWorkflowRecordsById(
    executionId: string,
    pluginType: PluginType,
    ids: Array<string>
  ): Observable<XmlSample[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/recordsbyids?workflowExecutionId=${executionId}&pluginType=${pluginType}`;
    return this.http
      .post<{ records: XmlSample[] }>(url, { ids })
      .pipe(
        map((samples) => {
          return samples.records;
        })
      );
  }

  // return available transformation histories
  getVersionHistory(executionId: string, pluginType: PluginType): Observable<HistoryVersion[]> {
    const url = `${apiSettings.apiHostCore}/orchestrator/workflows/evolution/${executionId}/${pluginType}`;
    return this.http.get<HistoryVersions>(url).pipe(
      map((res) => {
        return res.evolutionSteps;
      })
    );
  }

  //  get statistics for a certain dataset
  getStatistics(topologyName: TopologyName, taskId: string): Observable<Statistics> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/statistics`;
    return this.http.get<Statistics>(url);
  }

  getStatisticsDetail(
    topologyName: TopologyName,
    taskId: string,
    xPath: string
  ): Observable<NodePathStatistics> {
    const url = `${apiSettings.apiHostCore}/orchestrator/proxies/${topologyName}/task/${taskId}/nodestatistics?nodePath=${xPath}`;
    return this.http.get<NodePathStatistics>(url);
  }
}
