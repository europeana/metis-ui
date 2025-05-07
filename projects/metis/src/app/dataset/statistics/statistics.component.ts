import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs/operators';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';

import { CollapsibleDirective } from '../../_directives';
import { httpErrorNotification } from '../../_helpers';
import {
  Dataset,
  Notification,
  PluginExecution,
  Statistics
} from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { EditorComponent } from '../editor';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  imports: [NgIf, EditorComponent, NgFor, CollapsibleDirective, TranslatePipe]
})
export class StatisticsComponent extends SubscriptionManager implements OnInit {
  private readonly workflows = inject(WorkflowService);

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
      this.notification = httpErrorNotification(err);
      this.setLoading(false);
    };

    this.subs.push(
      this.workflows
        .getFinishedDatasetExecutions(this.datasetData.datasetId, 0)
        .pipe(
          tap((result) => {
            if (result.results.length > 0) {
              // find validation in the latest run, and if available, find taskid
              result.results[0].metisPlugins
                .filter((pe: PluginExecution) => {
                  return pe.pluginType === 'VALIDATION_EXTERNAL';
                })
                .forEach((pe: PluginExecution) => {
                  this.taskId = pe.externalTaskId;
                });
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
        .subscribe({
          next: (resultStatistics) => {
            this.statistics = resultStatistics;
            this.setLoading(false);
          },
          error: httpErrorHandling
        })
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
        .subscribe({
          next: (result) => {
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
          error: (err: HttpErrorResponse) => {
            this.notification = httpErrorNotification(err);
            this.setLoading(false);
          }
        })
    );
  }

  /** toggleStatistics
  /* toggles the expanded property
  */
  toggleStatistics(): void {
    this.expandedStatistics = !this.expandedStatistics;
  }
}
