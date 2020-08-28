/** Component to display executions history
/* - handles pagination
/* - handles report events
/* - handles task information copying
/* - handles redirects to the preview tab
*/
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
import { SubscriptionManager } from '../../shared/subscription-manager/subscription.manager';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent extends SubscriptionManager {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly router: Router
  ) {
    super();
  }

  @Input() datasetData: Dataset;

  @Output() setPreviewFilters = new EventEmitter<PreviewFilters | undefined>();
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();

  notification?: Notification;
  currentPage = 0;
  allExecutions: Array<WorkflowOrPluginExecution> = [];
  hasMore = false;
  report?: Report;
  contentCopied = false;
  maxResults = 0;
  maxResultsReached = false;
  lastExecutionId?: string;
  lastExecutionIsCompleted?: boolean;

  @Input()
  set lastExecutionData(lastExecution: WorkflowExecution | undefined) {
    // Only if there exists a last execution (i.e. there is a history) we need to retrieve the
    // history. Given that a last execution exists, we retrieve the history (again) if and only if
    // one of the following conditions hold:
    // - We don't have the history yet
    // - The last execution changed (i.e. a new execution appeared)
    // - The last execution became completed (i.e. it will now be part of the history)
    if (
      lastExecution &&
      (this.lastExecutionId !== lastExecution.id ||
        this.lastExecutionIsCompleted !== isWorkflowCompleted(lastExecution))
    ) {
      this.returnAllExecutions();
      this.lastExecutionId = lastExecution.id;
      this.lastExecutionIsCompleted = isWorkflowCompleted(lastExecution);
    }
  }

  /** returnAllExecutions
  /* - load the execution data
  /* - update the hasMore variable
  */
  returnAllExecutions(): void {
    this.subs.push(
      this.workflows
        .getCompletedDatasetExecutionsUptoPage(this.datasetData.datasetId, this.currentPage)
        .subscribe(
          ({ results, more, maxResultCountReached }) => {
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
            this.maxResultsReached = !!maxResultCountReached;
            this.maxResults = results.length;
          },
          (err: HttpErrorResponse) => {
            const error = this.errors.handleError(err);
            this.notification = httpErrorNotification(error);
          }
        )
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
