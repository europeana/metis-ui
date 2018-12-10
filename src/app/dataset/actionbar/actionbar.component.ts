import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import { PluginExecution, Report, ReportRequest, Workflow, WorkflowExecution } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { ProcessingInfo } from '../dataset.component';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
})
export class ActionbarComponent implements OnInit {
  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  private _lastExecutionData?: WorkflowExecution;

  @Input() showPluginLog?: PluginExecution;
  @Input() workflowData?: Workflow;
  @Input() isStarting = false;

  @Output() startWorkflow = new EventEmitter<void>();
  @Output() setProcessingInfo = new EventEmitter<ProcessingInfo>();
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();
  @Output() setReportRequest = new EventEmitter<ReportRequest | undefined>();

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
  report?: Report;

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

      if (
        value.workflowStatus === 'FINISHED' ||
        value.workflowStatus === 'CANCELLED' ||
        value.workflowStatus === 'FAILED'
      ) {
        if (value.workflowStatus === 'CANCELLED' || value.workflowStatus === 'FAILED') {
          this.now = value.updatedDate;
        } else {
          this.now = value.finishedDate;
        }
        this.currentStatus = value.workflowStatus;
      } else {
        this.setProcessingInfo.emit({
          totalProcessed: this.totalProcessed,
          currentPluginName: this.currentPluginName,
        });

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

  ngOnInit(): void {
    this.translate.use('en');
    this.cancelling = this.translate.instant('cancelling');
  }

  cancelWorkflow(): void {
    this.workflows.promptCancelThisWorkflow(this.lastExecutionData!.id);
  }

  showLog(): void {
    this.setShowPluginLog.emit(this.currentPlugin);
  }

  openReport(taskId: string, topology: string): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  // after double clicking, copy the execution and task id to the clipboard
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
