/** Parent component of the full Metis dashboard
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { environment } from '../../environments/environment';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import {
  AuthenticationService,
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
  runningTimer?: Subscription;

  runningIsLoading = true;
  runningIsFirstLoading = true;

  selectedExecutionDsId?: string;
  showPluginLog?: PluginExecution;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly documentTitleService: DocumentTitleService
  ) {}

  /** ngOnInit
  /* - set the document title
  /* - load the running executions
  /* - normalise / set the usernName variable
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Dashboard');
    this.getRunningExecutions();

    const user = this.authentication.getCurrentUser();
    if (user) {
      this.userName = user.firstName;
    }
  }

  /** ngOnDestroy
  /* clear the timeout
  */
  ngOnDestroy(): void {
    if (this.runningTimer) {
      this.runningTimer.unsubscribe();
    }
  }

  /** checkUpdateLog
  /* set the showPluginLog variable
  */
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

  /** getRunningExecutions
  /* - get all running executions
  /* - manage load-tracking variables
  /* - recommnece polling before returning
  */
  getRunningExecutions(): void {
    this.runningIsLoading = true;
    this.runningTimer = timer(0, environment.intervalStatus).subscribe(() => {
      this.workflows.getAllExecutionsCollectingPages(true).subscribe(
        (executions) => {
          this.runningExecutions = executions;
          this.runningIsLoading = false;
          this.runningIsFirstLoading = false;
          this.checkUpdateLog(executions);
        },
        (err: HttpErrorResponse) => {
          this.errors.handleError(err);
          this.runningIsLoading = false;
          this.runningIsFirstLoading = false;
        }
      );
    });
  }

  /** setSelectedExecutionDsId
  /* set the selectedExecutionDsId variable to the specified id
  */
  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
