import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, QueryList, ViewChildren } from '@angular/core';

import { environment } from '../../../environments/environment';
import { DatasetOverview } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

import { GridrowComponent } from './gridrow';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss'],
})
export class ExecutionsgridComponent implements AfterViewInit, OnDestroy {
  dsOverview: DatasetOverview[];
  finishedTimer: number;
  selectedIndex = -1;
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;

  @ViewChildren(GridrowComponent) rows: QueryList<GridrowComponent>;

  constructor(private workflows: WorkflowService, private errors: ErrorService) {}

  ngAfterViewInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    clearTimeout(this.finishedTimer);
  }
  loadNextPage(): void {
    this.currentPage++;
    this.isLoadingMore = true;
    clearTimeout(this.finishedTimer);
    this.load();
  }
  load(): void {
    this.workflows.getCompletedDatasetOverviewsUptoPage(this.currentPage).subscribe(
      ({ results, more }) => {
        this.hasMore = more;
        this.dsOverview = results;
        this.isLoading = false;
        this.isLoadingMore = false;
        this.finishedTimer = window.setTimeout(() => {
          this.isLoadingMore = true;
          this.load();
        }, environment.intervalStatusMedium);
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.isLoadingMore = false;
        this.errors.handleError(err);
      },
    );
  }

  setSelectedIndex(selectedIndex: number): void {
    this.selectedIndex = selectedIndex;
    this.rows.forEach((r) => {
      r.expanded = false;
    });
  }
}
