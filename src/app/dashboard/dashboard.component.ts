import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService, TranslateService, WorkflowService, ErrorService } from '../_services';
import { User, Notification } from '../_models';
import { StringifyHttpError } from '../_helpers';

import { environment } from '../../environments/environment';
import {timer as observableTimer, Observable} from 'rxjs';
import { LogStatus } from '../_models/log-status';
import { WorkflowExecution } from '../_models/workflow-execution';
import { Dataset } from '../_models/dataset';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [AuthenticationService]
})
export class DashboardComponent implements OnInit {

  user: User;
  userName: string;
  datasets: Dataset[];
  runningExecutionData: WorkflowExecution[] = [];
  ongoingExecutionDataOutput: WorkflowExecution[];
  executionData: WorkflowExecution[] = [];
  executionDataOutput: WorkflowExecution[];
  ts: number;
  tsO: number;
  intervalTimer = environment.intervalStatusShort;
  currentPageHistory = 0;
  stopChecking = true;

  public isShowingLog?: LogStatus;

  constructor(private authentication: AuthenticationService,
              private translate: TranslateService,
              private workflows: WorkflowService,
              private errors: ErrorService) {
  }

  /** ngOnInit
  /* init of this component
  /* start checking the status of ongoing executions
  /* set translation language
  */
  ngOnInit(): void {
    this.stopChecking = false;
    this.getOngoingExecutions();
    this.getExecutions();

    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.ts);
    clearTimeout(this.tsO);
    this.stopChecking = true;
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages
  /* @param {object} message - message to display in log modal
  */
  onNotifyShowLogStatus(message: LogStatus): void {
    this.isShowingLog = message;
  }

  getNextPage(page: number): void {
    this.currentPageHistory = page;
  }

  /** checkStatusOngoingExecutions
  /*  get the current status of the ongoing executions
  */
  checkStatusOngoingExecutions(): void {
    if (this.stopChecking) { return; }
    this.tsO = window.setTimeout(() => {
        this.runningExecutionData = [];
        this.getOngoingExecutions();
    }, this.intervalTimer);
  }

  /** checkStatusExecutions
  /*  get the current status of the executions
  */
  checkStatusExecutions(): void {
    if (this.stopChecking) { return; }
    this.ts = window.setTimeout(() => {
        this.executionData = [];
        this.getExecutions();
    }, this.intervalTimer);
  }

  /** getOngoingExecutions
  /*  get all ongoing executions and start polling again
  */
  getOngoingExecutions(page?: number): void {
    this.workflows.getAllExecutionsPerOrganisation((page ? page : 0), true).subscribe(executions => {
      this.runningExecutionData = this.runningExecutionData.concat(executions['results']);
      if (executions['nextPage'] !== -1) {
        this.getOngoingExecutions(executions['nextPage']);
      } else {
        this.ongoingExecutionDataOutput = this.runningExecutionData;
        this.checkStatusOngoingExecutions();
      }
    }, (err: HttpErrorResponse) => {
      clearTimeout(this.ts);
      clearTimeout(this.tsO);
      this.errors.handleError(err);
    });
  }

  /** getExecutions
  /*  get history of all executions (finished, cancelled, failed) and start polling again
  */
  getExecutions(page?: number): void {
    page = (page ? page : 0);
    this.workflows.getAllExecutionsPerOrganisation(page, false).subscribe(executions => {
      this.executionData = this.executionData.concat(executions['results']);
      if (this.currentPageHistory > 0 && page! < this.currentPageHistory) {
        page!++;
        this.getExecutions(page);
      } else {
        this.executionDataOutput = this.executionData;
        this.checkStatusExecutions();
      }
    }, (err: HttpErrorResponse) => {
      clearTimeout(this.ts);
      clearTimeout(this.tsO);
      this.errors.handleError(err);
    });
  }

}
