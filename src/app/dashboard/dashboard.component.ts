/** Parent component of the full Metis dashboard
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { delayWhen, switchMap, tap } from 'rxjs/operators';

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
  polledRunningData: Subscription;
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

    const user = Object.assign({ userName: '' }, this.authentication.getCurrentUser());
    this.userName = user.firstName;
  }

  /** ngOnDestroy
  /* clear the timeout
  */
  ngOnDestroy(): void {
    this.polledRunningData.unsubscribe();
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
  /* - get all running executions
  /* - manage load-tracking variables
  /* - recommnece polling before returning
  */
  getRunningExecutions(): void {
    const triggerDelay = new Subject<{ subject: Subject<boolean>; wait: number }>();
    triggerDelay
      .pipe(
        delayWhen((val) => {
          return timer(val.wait);
        }),
        tap((val) => val.subject.next(true))
      )
      .subscribe();

    const loadTriggerRunningExecutions = new BehaviorSubject(true);

    const polledRunningExecutions = loadTriggerRunningExecutions.pipe(
      switchMap(() => {
        return this.workflows.getAllExecutionsCollectingPages(true);
      }),
      tap(() => {
        triggerDelay.next({
          subject: loadTriggerRunningExecutions,
          wait: environment.intervalStatus
        });
      })
    ) as Observable<WorkflowExecution[]>;

    this.polledRunningData = polledRunningExecutions.subscribe(
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
  }

  /** setSelectedExecutionDsId
  /* set the selectedExecutionDsId variable to the specified id
  */
  setSelectedExecutionDsId(id: string): void {
    this.selectedExecutionDsId = id;
  }
}
