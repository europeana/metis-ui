/** Component to display executions history
 * - handles pagination
 * - handles report events
 * - handles task information copying
 * - handles redirects to the preview tab
 */
import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { copyExecutionAndTaskId, httpErrorNotification } from '../../_helpers';
import {
  executionsIncludeDeleted,
  isWorkflowCompleted,
  Notification,
  PreviewFilters,
  Report,
  ReportRequest,
  WorkflowExecution
} from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { NotificationComponent } from '../../shared';
import { ExecutionsDataGridComponent } from '../executions-data-grid';
import { UsernameComponent } from '../username';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [
    NotificationComponent,
    UsernameComponent,
    ExecutionsDataGridComponent,
    NgClass,
    DatePipe,
    TranslatePipe
  ]
})
export class HistoryComponent {
  private readonly workflows = inject(WorkflowService);
  private readonly router = inject(Router);

  public executionsIncludeDeleted = executionsIncludeDeleted;

  datasetId = input.required<string>();
  lastExecutionData = input<WorkflowExecution | undefined>(undefined);

  setPreviewFilters = output<PreviewFilters | undefined>();
  setReportMsg = output<ReportRequest | undefined>();

  currentPage = signal<number>(0);
  report = signal<Report | undefined>(undefined);
  contentCopied = signal<boolean>(false);
  templateRowIndex = signal<number>(0);
  manualNotification = signal<Notification | undefined>(undefined);

  private readonly workflowCompletionTrigger = linkedSignal<WorkflowExecution | undefined, string>({
    source: () => this.lastExecutionData(),
    computation: (exec) => {
      if (exec && isWorkflowCompleted(exec)) {
        return `${exec.id}-completed`;
      }
      return 'none';
    }
  });

  /** requestTrigger
   * - derived calculation tracking dataset identification, page markers, and execution states
   * - Using workflowCompletionTrigger ensures parameters only change when a status genuinely alters
   */
  private readonly requestTrigger = computed(() => {
    return {
      id: this.datasetId(),
      page: this.currentPage(),
      completionKey: this.workflowCompletionTrigger()
    };
  });

  /** historyResource
   * - manages the historical workflow executions fetching stream asynchronously
   * - in reaction to requestTrigger properties
   */
  private readonly historyResource = rxResource<
    { results: WorkflowExecution[]; more: boolean; maxResultCountReached?: boolean },
    { id: string; page: number; completionKey: string }
  >({
    params: () => this.requestTrigger(),
    stream: (ctx) =>
      this.workflows.getCompletedDatasetExecutionsUptoPage(ctx.params.id, ctx.params.page).pipe(
        map((response) => {
          if (!response?.results) {
            return response;
          }

          response.results.forEach((execution: WorkflowExecution) => {
            this.workflows.getReportsForExecution(execution);
            if (execution.metisPlugins) {
              execution.metisPlugins = [...execution.metisPlugins].reverse();
            }
          });
          return response;
        })
      )
  });

  // Protect value reads from throwing when the resource encounters an error state
  allExecutions = computed<WorkflowExecution[]>(() => {
    if (this.historyResource.error()) return [];
    return this.historyResource.value()?.results ?? [];
  });

  isLoading = computed<boolean>(() => this.historyResource.isLoading());
  maxResults = computed<number>(() => this.allExecutions().length);

  hasMore = computed<boolean>(() => {
    if (this.historyResource.error()) return false;
    return this.historyResource.value()?.more ?? false;
  });

  maxResultsReached = computed<boolean>(() => {
    if (this.historyResource.error()) return false;
    return !!this.historyResource.value()?.maxResultCountReached;
  });

  notification = computed<Notification | undefined>(() => {
    const manual = this.manualNotification();
    if (manual) return manual;

    const error = this.historyResource.error() as HttpErrorResponse | undefined;
    return error ? httpErrorNotification(error) : undefined;
  });

  // Constructor is completely gone—no effects, no untracked blocks, no timing hacks.

  /** loadNextPage
   * - increment page variable
   */
  loadNextPage(): void {
    this.currentPage.update((p) => p + 1);
  }

  /** openFailReport
   * emit the setReportMsg event
   */
  openFailReport(req: ReportRequest): void {
    this.setReportMsg.emit(req);
  }

  /** copyInformation
   * - copy current execution data to the clipboard
   * - update the contentCopied variable
   */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied.set(true);
  }

  /** goToPreview
   * - emit the setPreviewFilters event
   * - redirect to the preview
   */
  goToPreview(previewData: PreviewFilters): void {
    this.setPreviewFilters.emit(previewData);
    this.router.navigate(['/dataset/preview/' + this.datasetId()]);
  }
}
