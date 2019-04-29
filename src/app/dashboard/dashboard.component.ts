import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';
import { Dataset, getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import {
  AuthenticationService,
  DatasetsService,
  DocumentTitleService,
  ErrorService,
  WorkflowService
} from '../_services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string;
  runningExecutions: WorkflowExecution[];
  runningTimer: number | undefined;
  runningIsLoading = true;
  runningIsFirstLoading = true;
  finishedExecutions: WorkflowExecution[];
  finishedTimer: number | undefined;
  finishedIsLoading = true;
  finishedIsFirstLoading = true;
  finishedCurrentPage = 0;
  finishedHasMore = false;
  selectedExecutionDsId: string | undefined;
  showPluginLog?: PluginExecution;
  favoriteDatasets?: Dataset[];

  constructor(
    private authentication: AuthenticationService,
    private datasets: DatasetsService,
    private workflows: WorkflowService,
    private errors: ErrorService,
    private documentTitleService: DocumentTitleService
  ) {}

  ngOnInit(): void {
    this.documentTitleService.setTitle('Dashboard');

    this.getRunningExecutions();
    this.getFinishedExecutions();
    this.datasets.getFavorites().subscribe((datasets) => {
      datasets.reverse();
      this.favoriteDatasets = datasets;
    });

    const user = this.authentication.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.runningTimer);
    clearTimeout(this.finishedTimer);
    this.runningTimer = undefined;
    this.finishedTimer = undefined;
  }

  getNextPage(): void {
    this.finishedCurrentPage++;
    clearTimeout(this.finishedTimer);
    this.getFinishedExecutions();
  }

  checkUpdateLog(executions: WorkflowExecution[]): void {
    if (this.showPluginLog) {
      const showingId = this.showPluginLog.externalTaskId;
      executions.forEach((execution) => {
        const plugin = execution.metisPlugins.find((p) => p.externalTaskId === showingId);
        if (plugin) {
          this.showPluginLog = getCurrentPlugin(execution);
        }
      });
    }
  }

  //  get all running executions and start polling again
  getRunningExecutions(): void {
    this.runningIsLoading = true;
    this.workflows.getAllExecutionsCollectingPages(true).subscribe(
      (executions) => {
        this.runningExecutions = executions;
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;

        this.checkUpdateLog(executions);

        this.runningTimer = window.setTimeout(() => {
          this.getRunningExecutions();
        }, environment.intervalStatus);
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
      }
    );
  }

  //  get history of all executions (finished, cancelled, failed) and start polling again
  getFinishedExecutions(): void {
    this.finishedIsLoading = true;
    this.workflows.getAllExecutionsUptoPage(this.finishedCurrentPage, false).subscribe(
      ({ results, more }) => {
        this.finishedExecutions = results;
        this.finishedHasMore = more;
        this.finishedIsLoading = false;
        this.finishedIsFirstLoading = false;

        this.checkUpdateLog(results);

        this.finishedTimer = window.setTimeout(() => {
          this.getFinishedExecutions();
        }, environment.intervalStatusMedium);
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
        this.finishedIsLoading = false;
        this.finishedIsFirstLoading = false;
      }
    );
  }

  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
