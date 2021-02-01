import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { canCancelWorkflow, copyExecutionAndTaskId } from '../../_helpers';
import {
  getCurrentPlugin,
  isWorkflowCompleted,
  PluginExecution,
  SimpleReportRequest,
  TopologyName,
  Workflow,
  WorkflowExecution,
  WorkflowStatus
} from '../../_models';
import { WorkflowService } from '../../_services';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})
export class ActionbarComponent {
  constructor(private readonly workflows: WorkflowService) {}

  private _lastExecutionData?: WorkflowExecution;
  private subscription?: Subscription;

  @Input() datasetId: string;
  @Input() datasetName: string;
  @Input() showPluginLog?: PluginExecution;
  @Input() workflowData?: Workflow;
  @Input() isStarting = false;

  @Output() startWorkflow = new EventEmitter<void>();
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();

  currentPlugin?: PluginExecution;
  now?: string;
  workflowPercentage = 0;
  totalErrors = 0;
  hasReport = false;
  totalInDataset = 0;
  totalProcessed = 0;
  currentStatus?: string;
  currentPluginName?: string;
  currentExternalTaskId?: string;
  currentTopology?: TopologyName;

  isCancelling?: boolean;
  isCompleted?: boolean;
  cancelledBy?: string;
  contentCopied = false;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    this._lastExecutionData = value;

    if (value) {
      this.assignExecutionData(value);
    }
  }

  /** lastExecutionData
  /* accessor for _lastExecutionData variable
  */
  get lastExecutionData(): WorkflowExecution | undefined {
    return this._lastExecutionData;
  }

  checkCanCancelWorkflow(): boolean {
    if (this.isCompleted) {
      return false;
    }
    return canCancelWorkflow(this._lastExecutionData);
  }

  /** assignExecutionData
  /* - extract the model to the component
  /* - optionally show the log
  /*  @param {WorkflowExecution} value - the execution data
  */
  assignExecutionData(value: WorkflowExecution): void {
    this.currentPlugin = getCurrentPlugin(value);
    this.currentStatus = this.currentPlugin.pluginStatus;
    this.isCancelling = value.cancelling;
    this.isCompleted = isWorkflowCompleted(value);
    this.currentPluginName = this.currentPlugin.pluginType || '-';
    this.currentExternalTaskId = this.currentPlugin.externalTaskId;
    this.currentTopology = this.currentPlugin.topologyName;
    const { executionProgress } = this.currentPlugin;

    if (executionProgress) {
      // extract progress-tracking variables
      this.totalErrors = executionProgress.errors;
      this.hasReport = this.totalErrors > 0 || !!this.currentPlugin.hasReport;
      this.totalProcessed = executionProgress.processedRecords - this.totalErrors;
      this.totalInDataset = executionProgress.expectedRecords;
    }

    this.now = this.currentPlugin.updatedDate || this.currentPlugin.startedDate;
    this.workflowPercentage = 0;

    if (isWorkflowCompleted(value)) {
      if (value.workflowStatus === WorkflowStatus.FINISHED) {
        this.now = value.finishedDate;
      } else {
        this.now = value.updatedDate;
      }
      this.currentStatus = value.workflowStatus;

      // subscribe to cancelledBy service
      this.subscription = this.workflows.getWorkflowCancelledBy(value).subscribe((cancelledBy) => {
        this.cancelledBy = cancelledBy;
      });
    } else {
      if (
        this.currentPlugin.executionProgress &&
        this.totalProcessed !== 0 &&
        this.totalInDataset !== 0
      ) {
        this.workflowPercentage = this.currentPlugin.executionProgress.progressPercentage;
      }
    }

    if (this.showPluginLog) {
      this.showLog();
    }
  }

  /** beginWorkflow
  /* clear canceeled by, unsubscribe and emit startWorkflow event
  */
  beginWorkflow(): void {
    this.cancelledBy = '';
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.startWorkflow.emit();
  }

  /** cancelWorkflow
  /* cancel the workflow
  */
  cancelWorkflow(): void {
    this.workflows.promptCancelThisWorkflow(
      this.lastExecutionData!.id,
      this.datasetId,
      this.datasetName
    );
  }

  /** showLog
  /* show the log
  */
  showLog(): void {
    this.setShowPluginLog.emit(this.currentPlugin);
  }

  /** openFailReport
  /* open the fail report
  */
  openFailReport(topology?: TopologyName, taskId?: string, errorMsg?: string): void {
    this.setReportMsg.emit({ topology, taskId, message: errorMsg });
  }

  /** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
