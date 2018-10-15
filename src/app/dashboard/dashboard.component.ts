import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService, TranslateService, WorkflowService, ErrorService } from '../_services';
import { User, Notification } from '../_models';
import { StringifyHttpError } from '../_helpers';

import { environment } from '../../environments/environment';
import {timer as observableTimer, Observable} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [AuthenticationService]
})
export class DashboardComponent implements OnInit {

  user: User;
  userName: string;
  datasets;
  runningExecutionData:Array<any> = [];
  ongoingExecutionDataOutput;
  executionData:Array<any> = [];
  executionDataOutput;
  ts;
  tsO;
  intervalTimer: number = environment.intervalStatusShort;
  currentPageHistory: number = 0;
  stopChecking: boolean = true;

  public isShowingLog = false;

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
  ngOnInit() {
    this.stopChecking = false;
    this.getOngoingExecutions();
    this.getExecutions();
    
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  ngOnDestroy() {
    clearTimeout(this.ts);
    clearTimeout(this.tsO);
    this.stopChecking = true;
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages 
  /* @param {any} message - message to display in log modal
  */
  onNotifyShowLogStatus(message):void {
    this.isShowingLog = message;
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages 
  /* @param {any} message - message to display in log modal
  */
  getNextPage(page):void {
    this.currentPageHistory = page;
  }

  /** checkStatusOngoingExecutions
  /*  get the current status of the ongoing executions
  */
  checkStatusOngoingExecutions() {
    if (this.stopChecking) { return false; }
    this.tsO = setTimeout(() => {
        this.runningExecutionData = [];
        this.getOngoingExecutions();
    }, this.intervalTimer);
  }

  /** checkStatusExecutions
  /*  get the current status of the executions
  */
  checkStatusExecutions() {
    if (this.stopChecking) { return false; }
    this.ts = setTimeout(() => {
        this.executionData = [];
        this.getExecutions();
    }, this.intervalTimer);
  }

  /** getOngoingExecutions
  /*  get all ongoing executions and start polling again
  */
  getOngoingExecutions(page?) {
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
  getExecutions(page?) {
    page = (page ? page : 0);    
    this.workflows.getAllExecutionsPerOrganisation(page, false).subscribe(executions => {
      this.executionData = this.executionData.concat(executions['results']);
      if (this.currentPageHistory > 0 && page < this.currentPageHistory) {
        page++;
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
