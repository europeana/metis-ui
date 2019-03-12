// import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

import { Dataset, httpErrorNotification, NodeStatistics, Notification } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
})
export class StatisticsComponent implements OnInit {
  constructor(
    // private http: HttpClient,
    private errors: ErrorService,
    private workflows: WorkflowService,
  ) {}

  @Input() datasetData: Dataset;

  expandedStatistics = false;
  isLoading = false;
  notification?: Notification;
  statistics: NodeStatistics[];

  ngOnInit(): void {
    // this.editorConfig = this.editorPrefs.getEditorConfig(false);
    // this.editorIsDefaultTheme = this.editorPrefs.currentThemeIsDefault();
    // this.msgXSLTSuccess = this.translate.instant('xsltsuccessful');
    this.loadStatistics();
    // this.loadCustomXSLT();
  }

  //  loadStatistics(): void {
  //  }

  // load the data on statistics and display this in a card (=readonly editor)
  loadStatistics(): void {
    this.workflows.getFinishedDatasetExecutions(this.datasetData.datasetId, 0).subscribe(
      (result) => {
        let taskId: string | undefined;
        if (result.results.length > 0) {
          // find validation in the latest run, and if available, find taskid
          for (let i = 0; i < result.results[0].metisPlugins.length; i++) {
            if (result.results[0].metisPlugins[i].pluginType === 'VALIDATION_EXTERNAL') {
              taskId = result.results[0].metisPlugins[i].externalTaskId;
            }
          }
        }

        if (!taskId) {
          return;
        }
        this.isLoading = true;
        this.workflows.getStatistics('validation', taskId).subscribe(
          (resultStatistics) => {
            let statistics = resultStatistics.nodeStatistics;

            if (statistics.length > 100) {
              statistics = statistics.slice(0, 100);
            }
            statistics.forEach((statistic) => {
              const attrs = statistic.attributesStatistics;
              if (attrs.length > 100) {
                statistic.attributesStatistics = attrs.slice(0, 100);
              }
            });

            this.statistics = statistics;
            this.isLoading = false;
          },
          (err: HttpErrorResponse) => {
            const error = this.errors.handleError(err);
            this.notification = httpErrorNotification(error);
            this.isLoading = false;
          },
        );
        return;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
      },
    );
  }

  toggleStatistics(): void {
    this.expandedStatistics = !this.expandedStatistics;
  }
}
