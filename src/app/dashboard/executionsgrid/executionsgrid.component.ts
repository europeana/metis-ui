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
import { Subscription, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DatasetOverview } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

import { GridrowComponent } from './gridrow';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss']
})
export class ExecutionsgridComponent implements AfterViewInit, OnDestroy {
  dsOverview: DatasetOverview[];
  finishedTimer: Subscription;
  selectedDsId = '';
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;
  overviewParams: string;

  @Output() selectedSet: EventEmitter<string> = new EventEmitter();
  @ViewChildren(GridrowComponent) rows: QueryList<GridrowComponent>;

  constructor(private readonly workflows: WorkflowService, private readonly errors: ErrorService) {}

  /** ngAfterViewInit
  /* load the data
  */
  ngAfterViewInit(): void {
    this.load();
  }

  /** ngOnDestroy
  /* unsubscribe from timer
  */
  ngOnDestroy(): void {
    if (this.finishedTimer) {
      this.finishedTimer.unsubscribe();
    }
  }

  /** setOverviewParams
  /* - unsubscribe from timer
  *  - set the parameter string
  *  - re-initiate the load
  */
  setOverviewParams(overviewParams: string): void {
    this.overviewParams = overviewParams;
    this.load();
  }

  /** loadNextPage
  /* - increment the currentPage variable
  *  - set the isLoadingMore variable to true
  *  - re-initiate the load
  */
  loadNextPage(): void {
    this.currentPage++;
    this.isLoadingMore = true;
    this.load();
  }

  /** load
  /* unsubscribe from any existing
  /* subscribe to the dataset overview data
  */
  load(): void {
    if (this.finishedTimer) {
      this.finishedTimer.unsubscribe();
    }
    this.finishedTimer = timer(0, environment.intervalStatusMedium).subscribe(() => {
      this.isLoadingMore = true;
      this.workflows
        .getCompletedDatasetOverviewsUptoPage(this.currentPage, this.overviewParams)
        .subscribe(
          ({ results, more }) => {
            this.hasMore = more;
            this.dsOverview = results;
            this.isLoading = false;
            this.isLoadingMore = false;
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.isLoadingMore = false;
            this.errors.handleError(err);
          }
        );
    });
  }

  /** setSelectedDsId
  /* set the selected dataset id
  */
  setSelectedDsId(selectedDsId: string): void {
    this.selectedDsId = selectedDsId;
    this.rows.forEach((r) => {
      r.expanded = false;
    });
    this.selectedSet.emit(selectedDsId);
  }
}
