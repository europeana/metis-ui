import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

import { Dataset, httpErrorNotification, Notification, Statistics } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  constructor(private readonly errors: ErrorService, private readonly workflows: WorkflowService) {}

  @Input() datasetData: Dataset;

  expandedStatistics = false;
  isLoading = false;
  notification?: Notification;
  statistics: Statistics;
  taskId?: string;

  /** ngOnInit
  /* calls statisitics load function
  */
  ngOnInit(): void {
    this.loadStatistics();
  }

  /** setLoading
  /* setter for isLoading variable
  */
  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  /** loadStatistics
  /* loads statistics for finished datsets / externally validated plugins
  */
  loadStatistics(): void {
    this.setLoading(true);

    const httpErrorHandling = (err: HttpErrorResponse): void => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);
      this.setLoading(false);
    };

    this.workflows
      .getFinishedDatasetExecutions(this.datasetData.datasetId, 0)
      .subscribe((result) => {
        if (result.results.length > 0) {
          // find validation in the latest run, and if available, find taskid
          for (let i = 0; i < result.results[0].metisPlugins.length; i++) {
            if (result.results[0].metisPlugins[i].pluginType === 'VALIDATION_EXTERNAL') {
              this.taskId = result.results[0].metisPlugins[i].externalTaskId;
            }
          }
        }
        if (!this.taskId) {
          this.setLoading(false);
          return;
        }
        this.workflows.getStatistics('validation', this.taskId).subscribe((resultStatistics) => {
          const statistics = resultStatistics;
          this.statistics = statistics;
          this.setLoading(false);
        }, httpErrorHandling);
      }, httpErrorHandling);
  }

  /** loadMoreAttrs
  /* loads statistic details
  */
  loadMoreAttrs(xPath: string): void {
    if (!this.taskId) {
      return;
    }
    this.setLoading(true);
    this.workflows
      .getStatisticsDetail('validation', this.taskId, encodeURIComponent(xPath))
      .subscribe(
        (result) => {
          this.statistics.nodePathStatistics.forEach((stat) => {
            if (stat.xPath === result.xPath) {
              stat.moreLoaded = true;
              stat.nodeValueStatistics = result.nodeValueStatistics;
              return result;
            }
            return stat;
          });
          this.setLoading(false);
        },
        (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          console.log('Error: ' + error);
          this.notification = httpErrorNotification(error);
          this.setLoading(false);
        }
      );
  }

  /** toggleStatistics
  /* toggles the expanded property
  */
  toggleStatistics(): void {
    this.expandedStatistics = !this.expandedStatistics;
  }
}
