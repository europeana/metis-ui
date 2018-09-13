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
  ongoingExecutionData:Array<any> = [];
  ongoingExecutionDataOutput;
  subscription;
  intervalTimer: number = environment.intervalStatus;

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

    this.getOngoingExecutions();
    
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** onNotifyShowLogStatus
  /*  opens/closes the log messages 
  /* @param {any} message - message to display in log modal
  */
  onNotifyShowLogStatus(message):void {
    this.isShowingLog = message;
  }

  /** checkStatusExecutions
  /*  get the current status of the executions
  */
  checkStatusOngoingExecutions() {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.ongoingExecutionData = [];
      this.getOngoingExecutions();
      this.subscription.unsubscribe();
    });
  }

  getOngoingExecutions(page?) {
    this.workflows.getAllExecutionsPerOrganisation((page ? page : 0), true).subscribe(executions => {
      this.ongoingExecutionData = this.ongoingExecutionData.concat(executions['results']);
      if (executions['nextPage'] !== -1) {
        this.getOngoingExecutions(executions['nextPage']);
      } else {
        this.ongoingExecutionDataOutput = this.ongoingExecutionData;
        this.checkStatusOngoingExecutions();
      }
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
      this.subscription.unsubscribe();
    });
  }

}
