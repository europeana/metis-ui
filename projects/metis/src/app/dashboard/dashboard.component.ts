/** Parent component of the full Metis dashboard
 */
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';
import { environment } from '../../environments/environment';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import { AuthenticationService, DocumentTitleService, WorkflowService } from '../_services';
import { ExecutionsGridComponent } from './executionsgrid';
import { DatasetlogComponent } from '../dataset/datasetlog';
import { OngoingExecutionsComponent } from './ongoingexecutions';
import { DashboardactionsComponent } from './dashboardactions';

@Component({
  templateUrl: './dashboard.component.html',
  imports: [
    DashboardactionsComponent,
    NgIf,
    OngoingExecutionsComponent,
    DatasetlogComponent,
    ExecutionsGridComponent
  ]
})
export class DashboardComponent extends DataPollingComponent implements OnInit, OnDestroy {
  private readonly authentication = inject(AuthenticationService);
  private readonly workflows = inject(WorkflowService);
  private readonly documentTitleService = inject(DocumentTitleService);

  userName: string;
  runningExecutions: WorkflowExecution[];
  runningIsLoading = true;
  runningIsFirstLoading = true;

  selectedExecutionDsId?: string;
  showPluginLog?: PluginExecution;

  /** ngOnInit
  /* - set the document title
  /* - load the running executions
  /* - normalise / set the userName variable
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Dashboard');
    this.getRunningExecutions();
    const user = { userName: '', ...this.authentication.getCurrentUser() };
    this.userName = user.firstName as string;
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
      false,
      (executions: WorkflowExecution[]) => {
        this.runningExecutions = executions;
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
        this.checkUpdateLog(executions);
      },
      (err: HttpErrorResponse) => {
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
