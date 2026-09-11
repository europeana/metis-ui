/** Parent component of the full Metis dashboard
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { createPoller } from '../_helpers';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import { DocumentTitleService, WorkflowService } from '../_services';
import { TranslatePipe } from '../_translate';
import { ExecutionsGridComponent } from './executionsgrid';
import { OngoingExecutionsComponent } from './ongoingexecutions';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [OngoingExecutionsComponent, ExecutionsGridComponent, RouterLink, TranslatePipe]
})
export class DashboardComponent implements OnInit {
  private readonly keycloak = inject(Keycloak);
  private readonly workflows = inject(WorkflowService);
  private readonly documentTitleService = inject(DocumentTitleService);
  private readonly destroyRef = inject(DestroyRef);

  userName: string;
  runningExecutions: WorkflowExecution[];
  runningIsLoading = true;
  runningIsFirstLoading = true;

  selectedExecutionDsId?: string;
  showPluginLog?: PluginExecution;

  constructor() {
    this.getRunningExecutions();
    this.keycloak
      .loadUserProfile()
      .then((data) => {
        this.userName = data.username as string;
      })
      .catch((error) => console.log(error));
  }

  /** ngOnInit
  /* - set the document title
  /* - load the running executions
  /* - normalise / set the userName variable
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('Dashboard');
  }

  /** checkUpdateLog
  /* initialise the showPluginLog variable based on the current execution
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
    createPoller({
      interval: environment.intervalStatus,
      destroyRef: this.destroyRef,
      fnServiceCall: () => this.workflows.getAllExecutionsCollectingPages(true),
      fnDataProcess: (executions: WorkflowExecution[]) => {
        this.runningExecutions = executions;
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
        this.checkUpdateLog(executions);
      },
      fnOnError: (_: HttpErrorResponse) => {
        this.runningIsLoading = false;
        this.runningIsFirstLoading = false;
      }
    });
  }

  /** setSelectedExecutionDsId
  /* set the selectedExecutionDsId variable to the specified id
  */
  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
