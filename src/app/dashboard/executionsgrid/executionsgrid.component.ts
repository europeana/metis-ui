import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';

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
  selectedDsId = '';
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;

  @Output() selectedSet: EventEmitter<string> = new EventEmitter();
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

  setSelectedDsId(selectedDsId: string): void {
    this.selectedDsId = selectedDsId;
    this.rows.forEach((r) => {
      r.expanded = false;
    });
    this.selectedSet.emit(selectedDsId);
  }
}
