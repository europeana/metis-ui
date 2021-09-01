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
import { Observable, Subject } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';
import { environment } from '../../../environments/environment';
import { DatasetOverview, MoreResults, PluginExecutionOverview } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

import { GridrowComponent } from './gridrow';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss']
})
export class ExecutionsgridComponent extends DataPollingComponent
  implements AfterViewInit, OnDestroy {
  containsDeleted = false;
  dsOverview: DatasetOverview[];
  selectedDsId = '';
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;
  maxResultsReached = false;
  overviewParams = '';
  pollingRefresh: Subject<boolean>;
  idsWithDeleted: Array<string> = [];

  @Output() selectedSet: EventEmitter<string> = new EventEmitter();
  @ViewChildren(GridrowComponent) rows: QueryList<GridrowComponent>;

  constructor(private readonly workflows: WorkflowService, private readonly errors: ErrorService) {
    super();
  }

  /** ngAfterViewInit
  /* begin the data-polling the data
  */
  ngAfterViewInit(): void {
    this.beginPolling();
  }

  /** setOverviewParams
  /* - unsubscribe from timer
  /*  - set the parameter string
  /*  - refresh the polling
  /* @param {string} overviewParams - parameters as a string
  */
  setOverviewParams(overviewParams: string): void {
    if (this.overviewParams !== overviewParams) {
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
    const fnDataCall = (): Observable<MoreResults<DatasetOverview>> => {
      this.isLoading = true;
      return this.workflows.getCompletedDatasetOverviewsUptoPage(
        this.currentPage,
        this.overviewParams
      );
    };

    const fnDataProcess = (res: MoreResults<DatasetOverview>): void => {
      this.hasMore = res.more;
      this.dsOverview = res.results;
      this.isLoading = false;
      this.isLoadingMore = false;
      this.maxResultsReached = !!res.maxResultCountReached;

      res.results.forEach((dsExecution: DatasetOverview) => {
        dsExecution.execution.plugins.forEach((peo: PluginExecutionOverview) => {
          if (peo.progress && peo.progress.deletedRecords) {
            this.idsWithDeleted.push(dsExecution.execution.id);
          }
        });
      });
    };

    const fnError = (err: HttpErrorResponse): false | HttpErrorResponse => {
      this.isLoading = false;
      this.isLoadingMore = false;
      return this.errors.handleError(err);
    };

    this.pollingRefresh = this.createNewDataPoller(
      environment.intervalStatusMedium,
      fnDataCall,
      fnDataProcess,
      fnError
    ).getPollingSubject();
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
    this.containsDeleted = this.idsWithDeleted.includes(selectedDsId);
    this.selectedSet.emit(selectedDsId);
  }
}
