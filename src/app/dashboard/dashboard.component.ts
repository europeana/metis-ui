import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService, WorkflowService, ErrorService, AuthenticationService } from '../_services';

import { environment } from '../../environments/environment';
import { PluginExecution, WorkflowExecution } from '../_models/workflow-execution';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  userName: string;
  runningExecutions: WorkflowExecution[];
  runningTimer: number;
  runningIsLoading = true;
  runningIsFirstLoading = true;
  finishedExecutions: WorkflowExecution[];
  finishedTimer: number;
  finishedIsLoading = true;
  finishedIsFirstLoading = true;
  finishedCurrentPage = 0;
  finishedHasMore = false;
  showPluginLog?: PluginExecution;

  constructor(private authentication: AuthenticationService,
              private translate: TranslateService,
              private workflows: WorkflowService,
              private errors: ErrorService) {
  }

  ngOnInit(): void {
    this.getRunningExecutions();
    this.getFinishedExecutions();

    this.translate.use('en');

    const user = this.authentication.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.runningTimer);
    clearTimeout(this.finishedTimer);
  }

  setShowPluginLog(plugin: PluginExecution | undefined): void {
    this.showPluginLog = plugin;
  }

  getNextPage(): void {
    this.finishedCurrentPage ++;

    clearTimeout(this.finishedTimer);
    this.getFinishedExecutions();
  }

  checkUpdateLog(executions: WorkflowExecution[]): void {
    if (this.showPluginLog) {
      const showingId = this.showPluginLog.externalTaskId;
      executions.forEach((execution) => {
        const plugin = execution.metisPlugins.find(p => p.externalTaskId === showingId);
        if (plugin) {
          const currentPlugin = execution.metisPlugins[this.workflows.getCurrentPlugin(execution)];
          this.showPluginLog = currentPlugin;
        }
      });
    }
  }

  //  get all running executions and start polling again
  getRunningExecutions(): void {
    this.runningIsLoading = true;
    this.workflows.getAllExecutionsCollectingPages(true)
      .subscribe(executions => {
      this.runningExecutions = executions;
      this.runningIsLoading = false;
      this.runningIsFirstLoading = false;

      this.checkUpdateLog(executions);

      this.runningTimer = window.setTimeout(() => {
        this.getRunningExecutions();
      }, environment.intervalStatus);
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
      this.runningIsLoading = false;
      this.runningIsFirstLoading = false;
    });
  }

  //  get history of all executions (finished, cancelled, failed) and start polling again
  getFinishedExecutions(): void {
    this.finishedIsLoading = true;
    this.workflows.getAllExecutionsUptoPage(this.finishedCurrentPage, false)
      .subscribe(({ results, more }) => {
      this.finishedExecutions = results;
      this.finishedHasMore = more;
      this.finishedIsLoading = false;
      this.finishedIsFirstLoading = false;

      this.checkUpdateLog(results);

      this.finishedTimer = window.setTimeout(() => {
        this.getFinishedExecutions();
      }, environment.intervalStatusMedium);
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
      this.finishedIsLoading = false;
      this.finishedIsFirstLoading = false;
    });
  }

}
