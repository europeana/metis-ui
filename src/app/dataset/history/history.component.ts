import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { copyExecutionAndTaskId } from '../../_helpers';
import { Dataset } from '../../_models/dataset';
import { httpErrorNotification, Notification } from '../../_models/notification';
import { Report, ReportRequest } from '../../_models/report';
import {
  PluginExecution,
  WorkflowExecution,
  WorkflowStatus,
} from '../../_models/workflow-execution';
import { ErrorService, TranslateService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
  constructor(
    private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService,
  ) {}

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
      const status = execution.workflowStatus;
      if (
        (status === WorkflowStatus.FINISHED ||
          status === WorkflowStatus.FAILED ||
          status === WorkflowStatus.CANCELLED) &&
        execution.id !== this.lastWorkflowDoneId
      ) {
        this.returnAllExecutions();
      }
    }
  }

  ngOnInit(): void {
    this.returnAllExecutions();

    this.translate.use('en');
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

  scroll(el: Element): void {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  loadNextPage(): void {
    this.currentPage++;
    this.returnAllExecutions();
  }

  openReport(taskId: string, topology: string): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  closeReport(): void {
    this.report = undefined;
  }

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
