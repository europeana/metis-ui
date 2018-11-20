import {timer as observableTimer,  Subscription } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, AuthenticationService, ErrorService, TranslateService, DatasetsService } from '../../_services';
import { environment } from '../../../environments/environment';
import { LogStatus } from '../../_models/log-status';
import { Dataset } from '../../_models/dataset';
import { Workflow } from '../../_models/workflow';
import { Report } from '../../_models/report';
import { SubTaskInfo } from '../../_models/subtask-info';
import { WorkflowExecution, PluginExecution } from '../../_models/workflow-execution';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(public workflows: WorkflowService,
      public datasets: DatasetsService,
      private http: HttpClient,
      private authentication: AuthenticationService,
      private errors: ErrorService,
      private translate: TranslateService) { }

  @Input('isShowingLog') isShowingLog: LogStatus;
  @Input('datasetData') datasetData: Dataset;
  @Input('lastExecutionData') lastExecutionData: WorkflowExecution;
  @Input('workflowData') workflowData: Workflow;
  errorMessage: string;
  workflowPercentage = 0;
  subscription: Subscription;
  intervalTimer = environment.intervalStatusShort;
  now?: string;
  totalInDataset: number;
  totalProcessed = 0;
  totalErrors = 0;
  cancelling: string;
  currentStatus: string;
  currentWorkflow: WorkflowExecution;
  currentPluginName: string;
  currentExternalTaskId: string;
  currentTopology: string;
  currentPlugin = 0;
  logMessages: SubTaskInfo[];
  isShowingWorkflowSelector = false;
  workflowInfoAvailable = false;
  logIsOpen = false;
  contentCopied = false;
  workflowIsDone = false;
  report?: Report;

  @Output() notifyShowLogStatus: EventEmitter<LogStatus> = new EventEmitter<LogStatus>();

  /** ngOnInit
  /* init for this component:
  /* get most recently started execution
  /* act when workflow changed
  /* set language to use for translations
  */
  ngOnInit(): void {
    this.returnWorkflowInfo();
    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
      this.cancelling = this.translate.instant('cancelling');
    }
  }

  /** ngOnChanges
  /*  look for changes, and more specific the lastExecutionData
  */
  ngOnChanges(): void {
    if (this.workflowData && !this.workflowInfoAvailable) { this.returnWorkflowInfo(); }

    if (!this.lastExecutionData) { return; }
    if (!this.subscription || this.subscription.closed) {
      this.currentWorkflow = this.lastExecutionData;
      this.currentPlugin = this.workflows.getCurrentPlugin(this.currentWorkflow);

      const thisPlugin = this.currentWorkflow['metisPlugins'][this.currentPlugin];
      this.setCurrentPluginInfo(thisPlugin);
      this.startPollingWorkflow();
    }
  }

  /** returnWorkflowInfo
  /*  check if workflow info is already available
  */
  returnWorkflowInfo (): void {
    const workflowinfo = this.workflowData;
    if (workflowinfo) {
      this.workflowInfoAvailable = true;
    }
  }

  /** startPollingWorkflow
  /*  start a timer and start checking the status of a workflow
  */
  startPollingWorkflow(): void {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      if (!this.workflowInfoAvailable) { this.returnWorkflowInfo(); }
      this.pollingWorkflow();
    });
  }

  /** pollingWorkflow
  /*  check the current status of a workflow
  */
  pollingWorkflow(): void {
    if (!this.datasetData || !this.authentication.validatedUser()) { return; }

    const execution = this.lastExecutionData;
    this.currentWorkflow = this.lastExecutionData;
    if (!execution) {
      this.currentPlugin = 0;
      this.subscription.unsubscribe();
      this.workflows.setActiveWorkflow();
    } else {

      const e = execution;
      if (e['workflowStatus'] === 'FINISHED' || e['workflowStatus'] === 'CANCELLED' || e['workflowStatus'] === 'FAILED') {

        this.currentPlugin = 0;
        this.now = e['finishedDate'];
        this.workflowPercentage = 0;

        if (e['workflowStatus'] === 'CANCELLED' || e['workflowStatus'] === 'FAILED') {
          this.now = e['updatedDate'];
        }

        this.currentStatus = e['workflowStatus'];
        if (!this.workflowIsDone) {
          this.workflows.workflowDone(true);
          this.workflowIsDone = true;
        }

      } else {

        if (!this.currentWorkflow['metisPlugins'][this.currentPlugin]) { return; }

        if (this.currentPlugin !== this.workflows.getCurrentPlugin(e)) {
          this.workflows.updateHistory(e);
          const t = this.workflows.getCurrentPlugin(e);
          if (this.isShowingLog) {
            this.showLog(e['metisPlugins'][t].externalTaskId,
              e['metisPlugins'][t].topologyName,
              e['metisPlugins'][t].pluginType,
              e['metisPlugins'][t]['executionProgress'].processedRecords,
              e['metisPlugins'][t].pluginStatus);
          }
        }

        this.workflowPercentage = 0;
        this.currentPlugin = this.workflows.getCurrentPlugin(e);

        const thisPlugin = e['metisPlugins'][this.currentPlugin];
        this.setCurrentPluginInfo(thisPlugin, e['cancelling']);
        this.workflows.setCurrentProcessed(this.totalProcessed, this.currentPluginName);

        if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
          this.workflowPercentage = thisPlugin['executionProgress'].progressPercentage;
        }

        this.now = e['updatedDate'] === null ? thisPlugin['startedDate'] : thisPlugin['updatedDate'];

        this.workflows.workflowDone(false);
        this.workflowIsDone = false;
      }
    }
  }

  /** cancelWorkflow
  /*  cancel a running execution
  /* using id of current workflow
  */
  cancelWorkflow (): void {
    this.workflows.promptCancelThisWorkflow(this.currentWorkflow.id);
  }

  /** showLog
  /*  show the log for the current/last execution
  */
  showLog(taskid: string, topology: string, plugin: string, processed: number, status: string): void {
    const message = {'externaltaskId' : taskid, 'topology' : topology, 'plugin': plugin, 'processed': processed, 'status': status };
    this.notifyShowLogStatus.emit(message);
  }

  /** setCurrentPluginInfo
  /*  set correct value to different variables, used in the template
  /* @param {object} thisPlugin - current plugin
  /* @param {boolean} cancelling - has workflow been cancelled, optional
  */
  setCurrentPluginInfo(thisPlugin: PluginExecution, cancelling?: boolean): void {
    if (thisPlugin) {
      if (!cancelling) {
        this.currentStatus = thisPlugin.pluginStatus ? thisPlugin.pluginStatus : '-';
      } else {
        this.currentStatus = this.cancelling;
      }
      this.currentPluginName = thisPlugin.pluginType ? thisPlugin.pluginType : '-';
      this.currentExternalTaskId = thisPlugin.externalTaskId;
      this.currentTopology = thisPlugin.topologyName;
      this.totalErrors = thisPlugin['executionProgress'].errors;
      this.totalProcessed = thisPlugin['executionProgress'].processedRecords - this.totalErrors;
      this.totalInDataset = thisPlugin['executionProgress'].expectedRecords;
    }
  }

  /** selectWorkflow
  /*  select the workflow, so it would be triggered
  */
  selectWorkflow(): void {
    this.workflows.selectWorkflow();
  }

  /** getReport
  /*  get the report for a specific workflow step
  */
  openReport(taskid: string, topology: string): void {
    this.report = undefined;
    this.workflows.getReport(taskid, topology).subscribe(result => {
      this.workflows.setCurrentReport(result);
      this.report = result;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      if (error.toString() === 'retry') {
        this.openReport(taskid, topology);
      } else {
        this.errorMessage = `${StringifyHttpError(error)}`;
      }
    });
  }

  /** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation (type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

}
