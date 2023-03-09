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
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { copyExecutionAndTaskId } from '../../_helpers';
import {
  executionsIncludeDeleted,
  httpErrorNotification,
  isWorkflowCompleted,
  Notification,
  PreviewFilters,
  Report,
  ReportRequest,
  User,
  WorkflowExecution
} from '../../_models';
import { WorkflowService } from '../../_services';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent extends SubscriptionManager {
  public executionsIncludeDeleted = executionsIncludeDeleted;

  constructor(private readonly workflows: WorkflowService, private readonly router: Router) {
    super();
  }

  @Input() datasetId: string;
  @Output() setPreviewFilters = new EventEmitter<PreviewFilters | undefined>();
  @Output() setReportMsg = new EventEmitter<ReportRequest | undefined>();

  notification?: Notification;
  currentPage = 0;
  allExecutions: Array<WorkflowExecution> = [];
  hasMore = false;
  isLoading = false;
  report?: Report;
  contentCopied = false;
  maxResults = 0;
  maxResultsReached = false;
  lastExecutionId?: string;
  lastExecutionIsCompleted?: boolean;
  templateRowIndex = 0;

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
    this.isLoading = true;
    this.subs.push(
      this.workflows
        .getCompletedDatasetExecutionsUptoPage(this.datasetId, this.currentPage)
        .subscribe(
          ({ results, more, maxResultCountReached }) => {
            results.forEach((execution: WorkflowExecution) => {
              this.workflows.getReportsForExecution(execution);
              execution.metisPlugins.reverse();
            });
            this.allExecutions = results;
            this.hasMore = more;
            this.isLoading = false;
            this.maxResultsReached = !!maxResultCountReached;
            this.maxResults = results.length;
          },
          (err: HttpErrorResponse) => {
            this.notification = httpErrorNotification(err);
            this.isLoading = false;
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
  openFailReport(req: ReportRequest): void {
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

  /** goToPreview
  /* - emit the setPreviewFilters event
  /* - redirect to the preview
  */
  goToPreview(previewData: PreviewFilters): void {
    this.setPreviewFilters.emit(previewData);
    this.router.navigate(['/dataset/preview/' + this.datasetId]);
  }

  /** getCancelledBy
  /* get the cancelling user
  */
  getCancelledBy(workflow: WorkflowExecution): Observable<User | undefined> {
    return this.workflows.getWorkflowCancelledBy(workflow);
  }
}
