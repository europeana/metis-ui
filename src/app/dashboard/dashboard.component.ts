import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService, WorkflowService, ErrorService } from '../_services';

import { environment } from '../../environments/environment';
import { LogStatus } from '../_models/log-status';
import { WorkflowExecution } from '../_models/workflow-execution';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  runningExecutions: WorkflowExecution[] = [];
  runningTimer: number;
  runningIsLoading = true;
  finishedExecutions: WorkflowExecution[] = [];
  finishedTimer: number;
  finishedIsLoading = true;
  finishedCurrentPage = 0;

  public isShowingLog?: LogStatus;

  constructor(private translate: TranslateService,
              private workflows: WorkflowService,
              private errors: ErrorService) {
  }

  ngOnInit(): void {
    this.getRunningExecutions();
    this.getFinishedExecutions();

    this.translate.use('en');
  }

  ngOnDestroy(): void {
    clearTimeout(this.runningTimer);
    clearTimeout(this.finishedTimer);
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages
  */
  onNotifyShowLogStatus(message: LogStatus): void {
    this.isShowingLog = message;
  }

  getNextPage(): void {
    this.finishedCurrentPage ++;

    clearTimeout(this.finishedTimer);
    this.getFinishedExecutions();
  }

  /** getRunningExecutions
  /*  get all running executions and start polling again
  */
  getRunningExecutions(): void {
    this.runningIsLoading = true;
    this.workflows.getAllExecutionsCollectingPages(true)
      .subscribe(executions => {
      this.runningExecutions = executions;
      this.runningIsLoading = false;

      this.runningTimer = window.setTimeout(() => {
        this.getRunningExecutions();
      }, environment.intervalStatus);
    }, (err: HttpErrorResponse) => {
      this.handleError(err);
    });
  }

  /** getFinishedExecutions
  /*  get history of all executions (finished, cancelled, failed) and start polling again
  */
  getFinishedExecutions(): void {
    this.finishedIsLoading = true;
    this.workflows.getAllExecutionsUptoPage(this.finishedCurrentPage, false)
      .subscribe(executions => {
      this.finishedExecutions = executions;
      this.finishedIsLoading = false;

      this.finishedTimer = window.setTimeout(() => {
        this.getFinishedExecutions();
      }, environment.intervalStatusMedium);
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
