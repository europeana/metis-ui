import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  Dataset,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PreviewFilters,
  Report,
  SimpleReportRequest,
  WorkflowExecution,
  WorkflowOrPluginExecution
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly router: Router
  ) {}

  @Input() datasetData: Dataset;

  @Output() setPreviewFilters = new EventEmitter<PreviewFilters | undefined>();
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();

  notification?: Notification;
  currentPage = 0;
  allExecutions: Array<WorkflowOrPluginExecution> = [];
  hasMore = false;
  subscription: Subscription;
  report?: Report;
  contentCopied = false;

  lastWorkflowDoneId?: string;

  @Input()
  set lastExecutionData(execution: WorkflowExecution | undefined) {
    if (execution && isWorkflowCompleted(execution) && execution.id !== this.lastWorkflowDoneId) {
      this.returnAllExecutions();
    }
  }

  /** ngOnInit
  /* call load function for execution data
  */
  ngOnInit(): void {
    this.returnAllExecutions();
  }

  /** ngOnDestroy
  /* unsubscribe from data source
  */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /** returnAllExecutions
  /* - load the execution data
  /* - update the hasMore variable
  */
  returnAllExecutions(): void {
    this.workflows
      .getCompletedDatasetExecutionsUptoPage(this.datasetData.datasetId, this.currentPage)
      .subscribe(
        ({ results, more }) => {
          this.allExecutions = [];

          results.forEach((execution) => {
            this.workflows.getReportsForExecution(execution);
            execution.metisPlugins.reverse();

            this.allExecutions.push({ execution });
            execution.metisPlugins.forEach((pluginExecution) => {
              this.allExecutions.push({ execution, pluginExecution });
            });
          });

          this.hasMore = more;
          this.lastWorkflowDoneId = results[0] && results[0].id;
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
        }
      );
  }

  /** loadNextPage
  /* - increment page variable
  /* - load execution data
  */
  loadNextPage(): void {
    this.currentPage++;
    this.returnAllExecutions();
  }

  /** openFailReport
  /* emit the setReportMsg event
  */
  openFailReport(req: SimpleReportRequest): void {
    this.setReportMsg.emit(req);
  }

  /** copyInformation
  /* - copy current execution data to the clipboard
  /* - update the contentCopied variable
  */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  /** byId
  /* retrieve plugin execution or the execution id
  */
  byId(_: number, item: WorkflowOrPluginExecution): string {
    return item.pluginExecution ? item.pluginExecution.id : item.execution.id;
  }

  /** goToPreview
  /* - emit the setPreviewFilters event
  /* - redirect to the preview
  */
  goToPreview(previewData: PreviewFilters): void {
    this.setPreviewFilters.emit(previewData);
    this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]);
  }

  /** getCancelledBy
  /* get the cancelling user
  */
  getCancelledBy(workflow: WorkflowExecution): Observable<string | undefined> {
    return this.workflows.getWorkflowCancelledBy(workflow);
  }
}
