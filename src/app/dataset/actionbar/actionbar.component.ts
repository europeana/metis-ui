import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, ErrorService, TranslateService } from '../../_services';
import { LogStatus } from '../../_models/log-status';
import { Report } from '../../_models/report';
import { WorkflowExecution, PluginExecution } from '../../_models/workflow-execution';
import { Workflow } from '../../_models/workflow';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(public workflows: WorkflowService,
      private errors: ErrorService,
      private translate: TranslateService) { }

  private _lastExecutionData?: WorkflowExecution;

  @Input() isShowingLog: LogStatus;
  @Input() workflowData?: Workflow;
  errorMessage: string;
  currentPluginIndex = -1;
  currentPlugin?: PluginExecution;
  now?: string;
  cancelling?: string;
  workflowPercentage = 0;
  totalErrors = 0;
  totalInDataset = 0;
  totalProcessed = 0;
  currentStatus?: string;
  currentPluginName?: string;
  currentExternalTaskId?: string;
  currentTopology?: string;

  contentCopied = false;
  workflowIsDone = false;
  report?: Report;

  @Output() notifyShowLogStatus: EventEmitter<LogStatus> = new EventEmitter<LogStatus>();

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    this._lastExecutionData = value;

    if (value) {
      const index = this.workflows.getCurrentPlugin(value);
      this.currentPlugin = value.metisPlugins[index];

      if (!value.cancelling) {
        this.currentStatus = this.currentPlugin.pluginStatus || '-';
      } else {
        this.currentStatus = this.cancelling;
      }
      this.currentPluginName = this.currentPlugin.pluginType || '-';
      this.currentExternalTaskId = this.currentPlugin.externalTaskId;
      this.currentTopology = this.currentPlugin.topologyName;
      const { executionProgress } = this.currentPlugin;
      this.totalErrors = executionProgress.errors;
      this.totalProcessed = executionProgress.processedRecords - this.totalErrors;
      this.totalInDataset = executionProgress.expectedRecords;

      this.now = this.currentPlugin.updatedDate || this.currentPlugin.startedDate;
      this.workflowPercentage = 0;

      if (value.workflowStatus === 'FINISHED' || value.workflowStatus === 'CANCELLED' || value.workflowStatus === 'FAILED') {
        if (value.workflowStatus === 'CANCELLED' || value.workflowStatus === 'FAILED') {
          this.now = value.updatedDate;
        } else {
          this.now = value.finishedDate;
        }
        this.currentStatus = value.workflowStatus;
        if (!this.workflowIsDone) {
          this.workflows.workflowDone(true);
          this.workflowIsDone = true;
        }
      } else {
        if (index !== this.currentPluginIndex) {
          this.workflows.updateHistory(value);
          if (this.isShowingLog) {
            this.showLog(
              this.currentPlugin.externalTaskId,
              this.currentPlugin.topologyName,
              this.currentPlugin.pluginType,
              this.currentPlugin.executionProgress.processedRecords,
              this.currentPlugin.pluginStatus
            );
          }
        }

        this.workflows.setCurrentProcessed(this.totalProcessed, this.currentPluginName);

        if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
          this.workflowPercentage = this.currentPlugin.executionProgress.progressPercentage;
        }

        this.workflows.workflowDone(false);
        this.workflowIsDone = false;
      }
    }
  }

  get lastExecutionData(): WorkflowExecution | undefined {
    return this._lastExecutionData;
  }

  ngOnInit(): void {
    this.translate.use('en');
    this.cancelling = this.translate.instant('cancelling');
  }

  cancelWorkflow (): void {
    this.workflows.promptCancelThisWorkflow(this.lastExecutionData!.id);
  }

  showLog(taskId: string | undefined, topology: string, plugin: string, processed: number, status: string): void {
    const message = {'externalTaskId' : taskId, 'topology' : topology, 'plugin': plugin, 'processed': processed, 'status': status };
    this.notifyShowLogStatus.emit(message);
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
  openReport(taskId: string, topology: string): void {
    this.workflows.getReport(taskId, topology).subscribe(result => {
      this.report = result;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  onReportClosed(): void {
    this.report = undefined;
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
