import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { canCancelWorkflow, copyExecutionAndTaskId } from '../../_helpers';
import {
  getCurrentPlugin,
  isWorkflowCompleted,
  PluginExecution,
  PluginStatus,
  ReportRequest,
  TopologyName,
  Workflow,
  WorkflowExecution,
  WorkflowStatus
} from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe } from '../../_translate';
import { UsernameComponent } from '../username';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
  imports: [
    UsernameComponent,
    RouterLink,
    DecimalPipe,
    TitleCasePipe,
    DatePipe,
    TranslatePipe,
    RenameWorkflowPipe
  ]
})
export class ActionbarComponent {
  private readonly workflows = inject(WorkflowService);

  datasetId = input.required<string>();
  datasetName = input.required<string>();
  workflowData = input<Workflow>();
  isStarting = input<boolean>(false);

  startWorkflow = output<void>();
  setReportMsg = output<ReportRequest | undefined>();

  readonly PluginStatus = PluginStatus;

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
  contentCopied = false;

  lastExecutionData = input<WorkflowExecution | undefined, WorkflowExecution | undefined>(
    undefined,
    {
      transform: (value) => {
        if (value) {
          this.assignExecutionData(value);
        }
        return value;
      }
    }
  );

  checkCanCancelWorkflow = computed(() => {
    if (this.isCompleted) {
      return false;
    }
    return canCancelWorkflow(this.lastExecutionData());
  });

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
    this.currentPluginName = this.currentPlugin.pluginType ?? '-';
    this.currentExternalTaskId = this.currentPlugin.externalTaskId;
    this.currentTopology = this.currentPlugin.topologyName;
    const { executionProgress } = this.currentPlugin;

    if (executionProgress) {
      // extract progress-tracking variables
      this.totalErrors = executionProgress.failRecords + executionProgress.failDepublishRecords;
      this.hasReport = !!this.currentPlugin.hasReport || this.totalErrors > 0;
      this.totalProcessed = executionProgress.processedRecords - this.totalErrors;
      this.totalInDataset = executionProgress.expectedRecords;
    }

    this.now = this.currentPlugin.updatedDate ?? this.currentPlugin.startedDate;
    this.workflowPercentage = 0;

    if (this.isCompleted) {
      this.now =
        value.workflowStatus === WorkflowStatus.FINISHED ? value.finishedDate : value.updatedDate;
      this.currentStatus = value.workflowStatus;
    } else if (
      this.currentPlugin.executionProgress &&
      this.totalProcessed !== 0 &&
      this.totalInDataset !== 0
    ) {
      this.workflowPercentage = this.currentPlugin.executionProgress.progressPercentage;
    }
  }

  /** beginWorkflow
  /* emit startWorkflow event
  */
  beginWorkflow(): void {
    this.startWorkflow.emit();
  }

  /** cancelWorkflow
  /* cancel the workflow
  */
  cancelWorkflow(): void {
    const currentExecution = this.lastExecutionData();
    if (currentExecution) {
      this.workflows.promptCancelThisWorkflow(
        currentExecution.id,
        this.datasetId(),
        this.datasetName()
      );
    }
  }

  /** openFailReport
  /* open the fail report
  */
  openFailReport(topology?: TopologyName, taskId?: string, errorMsg?: string): void {
    const currentExecution = this.lastExecutionData();
    this.setReportMsg.emit({
      pluginType: this.currentPlugin?.pluginType,
      topology,
      taskId,
      message: errorMsg,
      workflowExecutionId: currentExecution?.id
    });
  }

  /** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
