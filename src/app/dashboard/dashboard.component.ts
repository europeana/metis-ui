import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService, TranslateService, WorkflowService, ErrorService, DatasetsService } from '../_services';
import { User } from '../_models';

import { environment } from '../../environments/environment';
import { switchMap } from 'rxjs/operators';
import { LogStatus } from '../_models/log-status';
import { WorkflowExecution } from '../_models/workflow-execution';
import { Dataset } from '../_models/dataset';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  user: User;
  userName: string;
  datasets: Dataset[];
  runningExecutions: WorkflowExecution[] = [];
  runningTimer: number;
  runningIsLoading = true;
  finishedExecutions: WorkflowExecution[] = [];
  finishedTimer: number;
  finishedIsLoading = true;
  finishedCurrentPage = 0;
  stopChecking = true;

  public isShowingLog?: LogStatus;

  constructor(private translate: TranslateService,
              private workflows: WorkflowService,
              private errors: ErrorService) {
  }

  /** ngOnInit
  /* init of this component
  /* start checking the status of running executions
  /* set translation language
  */
  ngOnInit(): void {
    this.stopChecking = false;
    this.getRunningExecutions();
    this.getFinishedExecutions();

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    clearTimeout(this.runningTimer);
    clearTimeout(this.finishedTimer);
    this.stopChecking = true;
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages
  /* @param {object} message - message to display in log modal
  */
  onNotifyShowLogStatus(message: LogStatus): void {
    this.isShowingLog = message;
  }

  getNextPage(): void {
    this.finishedCurrentPage ++;
    this.getFinishedExecutions();
  }

  /** checkStatusRunningExecutions
  /*  get the current status of the running executions
  */
  checkStatusRunningExecutions(): void {
    if (this.stopChecking) { return; }
    this.runningTimer = window.setTimeout(() => {
        this.getRunningExecutions();
    }, environment.intervalStatus);
  }

  /** checkStatusExecutions
  /*  get the current status of the executions
  */
  checkStatusFinishedExecutions(): void {
    if (this.stopChecking) { return; }
    this.finishedTimer = window.setTimeout(() => {
        this.getFinishedExecutions();
    }, environment.intervalStatusMedium);
  }

  /** getRunningExecutions
  /*  get all running executions and start polling again
  */
  getRunningExecutions(): void {
    clearTimeout(this.runningTimer);
    this.runningIsLoading = true;
    this.workflows.getAllExecutionsCollectingPages(true)
      .subscribe(executions => {
      this.runningExecutions = executions;
      this.runningIsLoading = false;
      this.checkStatusRunningExecutions();
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }

  /** getExecutions
  /*  get history of all executions (finished, cancelled, failed) and start polling again
  */
  getFinishedExecutions(): void {
    clearTimeout(this.finishedTimer);
    this.finishedIsLoading = true;
    this.workflows.getAllExecutionsUptoPage(this.finishedCurrentPage, false)
      .subscribe(executions => {
      this.finishedExecutions = executions;
      this.finishedIsLoading = false;
      this.checkStatusFinishedExecutions();
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }

  private handleError(err: HttpErrorResponse): void {
    clearTimeout(this.runningTimer);
    clearTimeout(this.finishedTimer);
    this.errors.handleError(err);
  }

}
