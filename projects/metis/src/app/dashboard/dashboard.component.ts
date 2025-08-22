/** Parent component of the full Metis dashboard
 */
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Observable } from 'rxjs';
import Keycloak from 'keycloak-js';

import { DataPollingComponent } from 'shared';
import { environment } from '../../environments/environment';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../_models';
import { DocumentTitleService, WorkflowService } from '../_services';
import { TranslatePipe } from '../_translate';
import { ExecutionsGridComponent } from './executionsgrid';
import { DatasetlogComponent } from '../dataset/datasetlog';
import { OngoingExecutionsComponent } from './ongoingexecutions';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    NgIf,
    OngoingExecutionsComponent,
    DatasetlogComponent,
    ExecutionsGridComponent,
    RouterLink,
    TranslatePipe
  ]
})
export class DashboardComponent extends DataPollingComponent implements OnInit, OnDestroy {
  private readonly keycloak = inject(Keycloak);
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
    this.keycloak
      .loadUserProfile()
      .then((data) => {
        this.userName = data.username as string;
      })
      .catch((error) => console.log(error));
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
