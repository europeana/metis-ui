import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  Dataset,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PluginExecution,
  Report,
  ReportRequest,
  TopologyName,
  WorkflowExecution,
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  constructor(private workflows: WorkflowService, private errors: ErrorService) {}

  @Input() datasetData: Dataset;

  @Output() setReportRequest = new EventEmitter<ReportRequest | undefined>();

  notification?: Notification;
  currentPage = 0;
  allExecutions: Array<WorkflowExecution | PluginExecution> = [];
  hasMore = false;
  subscription: Subscription;
  report?: Report;
  contentCopied = false;

  lastWorkflowDoneId?: string;

  @Input()
  set lastExecutionData(execution: WorkflowExecution | undefined) {
    if (execution) {
      if (isWorkflowCompleted(execution) && execution.id !== this.lastWorkflowDoneId) {
        this.returnAllExecutions();
      }
    }
  }

  ngOnInit(): void {
    this.returnAllExecutions();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  returnAllExecutions(): void {
    this.workflows
      .getCompletedDatasetExecutionsUptoPage(this.datasetData.datasetId, this.currentPage)
      .subscribe(
        ({ results, more }) => {
          this.allExecutions = [];

          results.forEach((execution) => {
            this.workflows.getReportsForExecution(execution);
            execution.metisPlugins.reverse();

            this.allExecutions.push(execution);
            execution.metisPlugins.forEach((pluginExecution) => {
              this.allExecutions.push(pluginExecution);
            });
          });

          this.hasMore = more;
          this.lastWorkflowDoneId = results[0] && results[0].id;
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
        },
      );
  }

  loadNextPage(): void {
    this.currentPage++;
    this.returnAllExecutions();
  }

  openReport(taskId: string, topology: TopologyName): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  byId(_: number, item: WorkflowExecution | PluginExecution): string {
    return item.id;
  }

  getPluginStatusClass(status: string): string {
    const s = status.toLowerCase();
    return s === 'failed' ? 'status-' + s : '';
  }
}
