/** Overview of the dashboard executions
/*  - polls data source for updates
/*  - handles pagination
/*  - handles selection
*/
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { merge, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { triggerDelay } from '../../_helpers';
import { DatasetOverview, MoreResults } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

import { GridrowComponent } from './gridrow';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss']
})
export class ExecutionsgridComponent implements AfterViewInit, OnDestroy {
  dsOverview: DatasetOverview[];
  selectedDsId = '';
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;
  maxResultsReached = false;
  overviewParams = '';

  pollingRefresh: Subject<boolean>;
  overviewSubscription: Subscription;

  @Output() selectedSet: EventEmitter<string> = new EventEmitter();
  @ViewChildren(GridrowComponent) rows: QueryList<GridrowComponent>;

  constructor(private readonly workflows: WorkflowService, private readonly errors: ErrorService) {}

  /** ngAfterViewInit
  /* begin the data-polling the data
  */
  ngAfterViewInit(): void {
    this.beginPolling();
  }

  /** ngOnDestroy
  /* unsubscribe from timer
  */
  ngOnDestroy(): void {
    this.overviewSubscription.unsubscribe();
  }

  /** setOverviewParams
  /* - unsubscribe from timer
  /*  - set the parameter string
  /*  - refresh the polling
  /* @param {string} overviewParams - parameters as a string
  */
  setOverviewParams(overviewParams: string): void {
    if (this.overviewParams != overviewParams) {
      this.overviewParams = overviewParams;
      this.pollingRefresh.next(true);
    }
  }

  /** loadNextPage
  /* - increment the currentPage variable
  /*  - set the isLoadingMore variable to true
  /*  - refresh the polling
  */
  loadNextPage(): void {
    this.currentPage++;
    this.isLoadingMore = true;
    this.pollingRefresh.next(true);
  }

  /** beginPolling
  *  - sets up a timed polling mechanism that only ticks when the last data-result has been retrieved
  *  - subscribes to the poll
  /* - instantiates a Subject for poll refreshing
  */
  beginPolling(): void {
    let pushPollOverview = 0;

    // stream for apply-filter
    this.pollingRefresh = new Subject();
    this.pollingRefresh.subscribe(() => {
      pushPollOverview += 1;
    });

    const loadTriggerOverview = new BehaviorSubject(true);
    const polledOverviewData = loadTriggerOverview.pipe(
      merge(this.pollingRefresh), // user events comes into the stream here
      switchMap(() => {
        this.isLoading = true;
        return this.workflows.getCompletedDatasetOverviewsUptoPage(
          this.currentPage,
          this.overviewParams
        );
      }),
      tap(() => {
        triggerDelay.next({
          subject: loadTriggerOverview,
          wait: environment.intervalStatusMedium,
          blockIf: () => pushPollOverview > 0,
          blockThen: () => {
            pushPollOverview--;
          }
        });
      })
    ) as Observable<MoreResults<DatasetOverview>>;

    this.overviewSubscription = polledOverviewData.subscribe(
      ({ results, more, maxResultCountReached }) => {
        this.hasMore = more;
        this.dsOverview = results;
        this.isLoading = false;
        this.isLoadingMore = false;
        this.maxResultsReached = !!maxResultCountReached;
        console.error('maxResultCountReached = ' + maxResultCountReached);
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isLoadingMore = false;
        this.errors.handleError(err);
      }
    );
  }

  /** setSelectedDsId
  /* sets 'expanded' to false on all the rows
  /* set the selected dataset id
  /* emits selectedSet event
  /* @param {string} selectedDsId - the selected dataset id
  */
  setSelectedDsId(selectedDsId: string): void {
    this.selectedDsId = selectedDsId;
    this.rows.forEach((r) => {
      r.expanded = false;
    });
    this.selectedSet.emit(selectedDsId);
  }
}
