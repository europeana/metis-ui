import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {timer as observableTimer, Observable} from 'rxjs';
import { environment } from '../../../environments/environment';

import { WorkflowService, AuthenticationService, TranslateService, ErrorService } from '../../_services';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html'
})
export class DatasetlogComponent implements OnInit {

  constructor(private workflows: WorkflowService, 
    private authentication: AuthenticationService, 
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input('isShowingLog') isShowingLog;
  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  logMessages;
  logPerStep: number = 100;
  logStep: number = 1;
  logFrom: number = 1;
  logTo: number = this.logStep * this.logPerStep;
  logPlugin;
  subscription;
  intervalTimer = environment.intervalStatus;
  noLogs: string;
  noLogMessage: string;


  /** ngOnInit
  /* init for this specific component
  /* return the log information
  /* and set translation langugaes
  */
  ngOnInit() {
    this.logStep = 1;
    this.logTo = this.logStep * this.logPerStep;
    this.startPolling();

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.noLogs = this.translate.instant('nologs'); 
    }

    if (this.isShowingLog && this.isShowingLog['processed'] && this.isShowingLog['status'] === 'RUNNING') {
      this.logTo = this.isShowingLog['processed'];
      this.logFrom = (this.logTo - this.logPerStep) >= 1 ? (this.logTo - this.logPerStep) + 1 : 1;
      this.logStep = Math.floor(this.isShowingLog['processed'] / this.logPerStep);
    }
  }

  /** closeLog
  /* close log modal window
  */
  closeLog() {
  	this.notifyShowLogStatus.emit(false);
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /** startPolling
  /*  check for new logs
  */
  startPolling() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.noLogMessage = undefined;
      this.returnLog();
    });
  }

  /** returnLog
  /* get content of log, based on external taskid and topology
  */
  returnLog() {

    if (!this.isShowingLog || !this.isShowingLog['externaltaskId'] || !this.isShowingLog['topology']) { return false; }
      
    if (this.logPlugin !== this.isShowingLog['plugin'] && this.isShowingLog['processed'] === 0) {
      this.logFrom = 1;
      this.logTo = this.logPerStep;
      this.logStep = 1;
    }

    this.logPlugin = this.isShowingLog['plugin'];

    if (this.isShowingLog['processed'] && (this.isShowingLog['status'] === 'FINISHED') || (this.isShowingLog['status'] === 'CANCELLED') || (this.isShowingLog['status'] === 'FAILED')) { 
      this.logTo = this.isShowingLog['processed']; 
      this.logFrom = (this.logTo - this.logPerStep) >= 1 ? (this.logTo - this.logPerStep) : 1;
      if (this.subscription) { this.subscription.unsubscribe(); }
    }

    this.workflows.getLogs(this.isShowingLog['externaltaskId'], this.isShowingLog['topology'], this.logFrom, this.logTo).subscribe(result => {
      if (result && (<any>result).length > 0) {
        this.logMessages = result;

        if ((<any>result).length === this.logPerStep) {
          this.logFrom = this.logTo + 1;
          this.logTo = ((<any>result).length * this.logStep) + this.logPerStep;
          this.logStep += 1;
          this.returnLog();
        } 
      } else {
        if ((<any>result).length === 0) {
          this.noLogMessage = this.noLogs;
          return false;
        }
      }
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }
  
}
