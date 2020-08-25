import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';

import { Dataset, httpErrorNotification, Notification, Statistics } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { SubscriptionManager } from '../../shared/subscription-manager/subscription.manager';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent extends SubscriptionManager implements OnInit {
  constructor(private readonly errors: ErrorService, private readonly workflows: WorkflowService) {
    super();
  }

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
  /* - loads statistics for finished datasets / externally validated plugins
  /* - updates the notification variable
  /* - updates the loading variable
  /* - updates the statistics variable
  */
  loadStatistics(): void {
    this.setLoading(true);

    const httpErrorHandling = (err: HttpErrorResponse): void => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);
      this.setLoading(false);
    };

    this.subs.push(
      this.workflows
        .getFinishedDatasetExecutions(this.datasetData.datasetId, 0)
        .pipe(
          tap((result) => {
            if (result.results.length > 0) {
              // find validation in the latest run, and if available, find taskid
              for (let i = 0; i < result.results[0].metisPlugins.length; i++) {
                if (result.results[0].metisPlugins[i].pluginType === 'VALIDATION_EXTERNAL') {
                  this.taskId = result.results[0].metisPlugins[i].externalTaskId;
                }
              }
            }
          }),
          filter(() => {
            if (!this.taskId) {
              // return if there's no task id
              this.setLoading(false);
            }
            return !!this.taskId;
          }),
          switchMap(() => {
            return this.workflows.getStatistics('validation', `${this.taskId}`);
          })
        )
        .subscribe((resultStatistics) => {
          this.statistics = resultStatistics;
          this.setLoading(false);
        }, httpErrorHandling)
    );
  }

  /** loadMoreAttrs
  /* loads statistic details
  */
  loadMoreAttrs(xPath: string): void {
    if (!this.taskId) {
      return;
    }
    this.setLoading(true);
    this.subs.push(
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
        )
    );
  }

  /** toggleStatistics
  /* toggles the expanded property
  */
  toggleStatistics(): void {
    this.expandedStatistics = !this.expandedStatistics;
  }
}
