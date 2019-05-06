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
    this.runningTimer = undefined;
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

  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
