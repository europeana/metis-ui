/** Parent component of the full Metis dashboard
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataPollingComponent } from '../data-polling';
import { environment } from '../../environments/environment';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import {
  AuthenticationService,
  DocumentTitleService,
  ErrorService,
  WorkflowService
} from '../_services';

@Component({
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends DataPollingComponent implements OnInit, OnDestroy {
  userName: string;
  runningExecutions: WorkflowExecution[];
  runningIsLoading = true;
  runningIsFirstLoading = true;

  selectedExecutionDsId?: string;
  showPluginLog?: PluginExecution;

  constructor(
    private readonly authentication: AuthenticationService,
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly documentTitleService: DocumentTitleService
  ) {
    super();
  }

  /** ngOnInit
  /* - set the document title
  /* - load the running executions
  /* - normalise / set the usernName variable
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Dashboard');
    this.getRunningExecutions();

    const user = Object.assign({ userName: '' }, this.authentication.getCurrentUser());
    this.userName = user.firstName;
  }

  /** checkUpdateLog
  /* set the showPluginLog variable
  */
  checkUpdateLog(executions: WorkflowExecution[]): void {
    if (this.showPluginLog) {
      const showingId = this.showPluginLog.externalTaskId;
      executions
        .filter((execution) => {
          return execution.metisPlugins.find((p) => p.externalTaskId === showingId);
        })
        .forEach((execution) => {
          this.showPluginLog = getCurrentPlugin(execution);
        });
    }
  }

  /** getRunningExecutions
  /* - poll running data
  */
  getRunningExecutions(): void {
    this.createNewDataPoller(
      environment.intervalStatus,
      (): Observable<WorkflowExecution[]> => {
        return this.workflows.getAllExecutionsCollectingPages(true);
      },
      (executions: WorkflowExecution[]) => {
        this.runningExecutions = executions;
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
        this.checkUpdateLog(executions);
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
        return err;
      }
    );
  }

  /** setSelectedExecutionDsId
  /* set the selectedExecutionDsId variable to the specified id
  */
  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
