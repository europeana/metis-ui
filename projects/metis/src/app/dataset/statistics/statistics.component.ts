import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal, computed } from '@angular/core';
import { filter, switchMap, take, tap } from 'rxjs/operators';

import { CollapsibleDirective } from '../../_directives';
import { httpErrorNotification } from '../../_helpers';
import { Dataset, Notification, PluginExecution, Statistics } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslatePipe } from '../../_translate';
import { EditorComponent } from '../editor';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  imports: [EditorComponent, CollapsibleDirective, TranslatePipe]
})
export class StatisticsComponent implements OnInit {
  private readonly workflows = inject(WorkflowService);

  datasetData = input.required<Dataset>();
  expandedStatistics = signal(false);
  isLoading = signal(false);
  notification?: Notification;

  statistics = signal<Statistics | undefined>(undefined);
  taskId?: string;

  showLoadingSpinner = computed(() => this.isLoading() && !this.statistics());

  ngOnInit(): void {
    this.loadStatistics();
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  loadStatistics(): void {
    this.setLoading(true);

    const httpErrorHandling = (err: HttpErrorResponse): void => {
      queueMicrotask(() => {
        this.notification = httpErrorNotification(err);
        this.setLoading(false);
      });
    };

    this.workflows
      .getFinishedDatasetExecutions(this.datasetData().datasetId, 0)
      .pipe(
        take(1),
        tap((result) => {
          if (result.results.length > 0) {
            result.results[0].metisPlugins
              .filter((pe: PluginExecution) => pe.pluginType === 'VALIDATION_EXTERNAL')
              .forEach((pe: PluginExecution) => {
                this.taskId = pe.externalTaskId;
              });
          }
        }),
        filter(() => {
          if (!this.taskId) {
            queueMicrotask(() => this.setLoading(false));
          }
          return !!this.taskId;
        }),
        switchMap(() => this.workflows.getStatistics('validation', `${this.taskId}`))
      )
      .subscribe({
        next: (resultStatistics) => {
          queueMicrotask(() => {
            this.statistics.set(resultStatistics);
            this.setLoading(false);
          });
        },
        error: httpErrorHandling
      });
  }

  loadMoreAttrs(xPath: string): void {
    if (!this.taskId) {
      return;
    }
    this.setLoading(true);
    this.workflows
      .getStatisticsDetail('validation', this.taskId, encodeURIComponent(xPath))
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          queueMicrotask(() => {
            const currentStats = this.statistics();
            if (currentStats) {
              this.statistics.set({
                ...currentStats,
                nodePathStatistics: currentStats.nodePathStatistics.map((stat) => {
                  if (stat.xPath === result.xPath) {
                    return {
                      ...stat,
                      moreLoaded: true,
                      nodeValueStatistics: result.nodeValueStatistics
                    };
                  }
                  return stat;
                })
              });
            }
            this.setLoading(false);
          });
        },
        error: (err: HttpErrorResponse) => {
          queueMicrotask(() => {
            this.notification = httpErrorNotification(err);
            this.setLoading(false);
          });
        }
      });
  }

  toggleStatistics(): void {
    this.expandedStatistics.set(!this.expandedStatistics());
  }
}
