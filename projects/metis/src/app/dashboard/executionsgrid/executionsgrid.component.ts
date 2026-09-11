/** Overview of the dashboard executions
/*  - polls data source for updates
/*  - handles pagination
/*  - handles selection
*/
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, output, viewChildren } from '@angular/core';

import { environment } from '../../../environments/environment';
import { DatasetOverview, MoreResults, PluginExecutionOverview } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslatePipe } from '../../_translate';

import { createPoller, DataPoller } from '../../_helpers';

import { GridrowComponent } from './gridrow';
import { FilterOpsComponent } from '../filter-ops';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss'],
  imports: [FilterOpsComponent, GridrowComponent, NgTemplateOutlet, TranslatePipe]
})
export class ExecutionsGridComponent {
  containsDeleted = false;
  dsOverview: DatasetOverview[];
  selectedDsId = '';
  isLoading = true;
  isLoadingMore = false;
  hasMore = false;
  currentPage = 0;
  maxResultsReached = false;
  overviewParams = '';
  pollingRefresh!: DataPoller;
  idsWithDeleted: Array<string> = [];
  selectedSet = output<string>();
  readonly rows = viewChildren(GridrowComponent);

  constructor(private readonly workflows: WorkflowService) {
    this.beginPolling();
  }

  /** setOverviewParams
  /* - set the parameter string
  /* - reset pagination back to page 0 for new queries
  /* - refresh the polling
  /* @param {string} overviewParams - parameters as a string
  */
  setOverviewParams(overviewParams: string): void {
    if (this.overviewParams !== overviewParams) {
      this.overviewParams = overviewParams;
      this.currentPage = 0;
      this.pollingRefresh.next();
    }
  }

  /** loadNextPage
  /* - increment the currentPage variable
  /* - set the isLoadingMore variable to true
  /* - refresh the polling
  */
  loadNextPage(): void {
    this.currentPage++;
    this.isLoadingMore = true;
    this.pollingRefresh.next();
  }

  /** beginPolling
   * - sets up a timed polling mechanism that always uses current class property values
   */
  beginPolling(): void {
    const fnDataProcess = (res: MoreResults<DatasetOverview>): void => {
      this.hasMore = res.more;
      this.dsOverview = res.results;
      this.isLoading = false;
      this.isLoadingMore = false;
      this.maxResultsReached = !!res.maxResultCountReached;

      this.idsWithDeleted = []; // Reset tracked state to avoid appending cumulative page history bugs
      res.results.forEach((dsExecution: DatasetOverview) => {
        dsExecution.execution.plugins.forEach((peo: PluginExecutionOverview) => {
          if (peo.progress && peo.progress.successDepublishRecords) {
            this.idsWithDeleted.push(dsExecution.execution.id);
          }
        });
      });
    };

    const fnError = (err: HttpErrorResponse): false | HttpErrorResponse => {
      this.isLoading = false;
      this.isLoadingMore = false;
      return err;
    };

    this.pollingRefresh = createPoller({
      interval: environment.intervalStatusMedium,
      fnServiceCall: () =>
        this.workflows.getCompletedDatasetOverviewsUptoPage(this.currentPage, this.overviewParams),
      fnDataProcess: fnDataProcess,
      fnOnError: fnError
    });
  }

  /** setSelectedDsId
  /* sets 'expanded' to false on all the rows
  /* set the selected dataset id
  /* emits selectedSet event
  /* @param {string} selectedDsId - the selected dataset id
  */
  setSelectedDsId(selectedDsId: string): void {
    this.selectedDsId = selectedDsId;
    this.rows().forEach((r) => {
      r.expanded.set(false);
    });
    this.containsDeleted = this.idsWithDeleted.includes(selectedDsId);
    this.selectedSet.emit(selectedDsId);
  }
}
