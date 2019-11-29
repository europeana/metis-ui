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
import { concatMap } from 'rxjs/operators';
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
  finishedSubscription: Subscription;
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
    if (this.finishedSubscription) {
      this.finishedSubscription.unsubscribe();
    }
  }

  /** setOverviewParams
  /* - unsubscribe from timer
  /*  - set the parameter string
  /*  - re-initiate the load
  /* @param {string} overviewParams - parameters as a string
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
    if (this.finishedSubscription) {
      this.finishedSubscription.unsubscribe();
    }

    const polledData = timer(0, environment.intervalStatusMedium).pipe(
      concatMap(() => {
        this.isLoadingMore = true;
        return this.workflows.getCompletedDatasetOverviewsUptoPage(
          this.currentPage,
          this.overviewParams
        );
      })
    );

    this.finishedSubscription = polledData.subscribe(
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
