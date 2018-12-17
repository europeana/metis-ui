import { Component, EventEmitter, Input, Output } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  getCurrentPlugin,
  isWorkflowCompleted,
  PluginExecution,
  Report,
  ReportRequest,
  TopologyName,
  Workflow,
  WorkflowExecution,
  WorkflowStatus,
} from '../../_models';
import { WorkflowService } from '../../_services';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
})
export class ActionbarComponent {
  constructor(private workflows: WorkflowService) {}

  private _lastExecutionData?: WorkflowExecution;

  @Input() datasetId: string;
  @Input() showPluginLog?: PluginExecution;
  @Input() workflowData?: Workflow;
  @Input() isStarting = false;

  @Output() startWorkflow = new EventEmitter<void>();
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();
  @Output() setReportRequest = new EventEmitter<ReportRequest | undefined>();

  currentPlugin?: PluginExecution;
  now?: string;
  workflowPercentage = 0;
  totalErrors = 0;
  totalInDataset = 0;
  totalProcessed = 0;
  currentStatus?: string;
  currentPluginName?: string;
  currentExternalTaskId?: string;
  currentTopology?: TopologyName;

  isCancelling?: boolean;
  isCompleted?: boolean;

  contentCopied = false;
  report?: Report;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    this._lastExecutionData = value;

    if (value) {
      this.currentPlugin = getCurrentPlugin(value);
      this.currentStatus = this.currentPlugin.pluginStatus;

      this.isCancelling = value.cancelling;
      this.isCompleted = isWorkflowCompleted(value);
      this.currentPluginName = this.currentPlugin.pluginType || '-';
      this.currentExternalTaskId = this.currentPlugin.externalTaskId;
      this.currentTopology = this.currentPlugin.topologyName;
      const { executionProgress } = this.currentPlugin;
      this.totalErrors = executionProgress.errors;
      this.totalProcessed = executionProgress.processedRecords - this.totalErrors;
      this.totalInDataset = executionProgress.expectedRecords;

      this.now = this.currentPlugin.updatedDate || this.currentPlugin.startedDate;
      this.workflowPercentage = 0;

      if (isWorkflowCompleted(value)) {
        if (value.workflowStatus === WorkflowStatus.FINISHED) {
          this.now = value.finishedDate;
        } else {
          this.now = value.updatedDate;
        }
        this.currentStatus = value.workflowStatus;
      } else {
        if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
          this.workflowPercentage = this.currentPlugin.executionProgress.progressPercentage;
        }
      }

      if (this.showPluginLog) {
        this.showLog();
      }
    }
  }

  get lastExecutionData(): WorkflowExecution | undefined {
    return this._lastExecutionData;
  }

  cancelWorkflow(): void {
    this.workflows.promptCancelThisWorkflow(this.lastExecutionData!.id);
  }

  showLog(): void {
    this.setShowPluginLog.emit(this.currentPlugin);
  }

  openReport(taskId: string, topology: TopologyName): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  // after double clicking, copy the execution and task id to the clipboard
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
