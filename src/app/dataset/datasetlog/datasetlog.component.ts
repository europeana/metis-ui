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
    this.logPerStep = 100;
    this.logStep = 1;
    this.logTo = this.logStep * this.logPerStep;
    this.startPolling();
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.noLogs = this.translate.instant('nologs'); 
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
    this.logPlugin = this.isShowingLog['plugin']
    this.workflows.getLogs(this.isShowingLog['externaltaskId'], this.isShowingLog['topology'], this.logFrom, this.logTo).subscribe(result => {
      if (result && (<any>result).length > 0) {
        this.logMessages = result;
        if ((<any>result).length === (this.logPerStep * this.logStep)) {
          this.logTo = (<any>result).length + this.logPerStep;
          this.logStep += 1;
          this.returnLog();
        }
      } else {
        this.noLogMessage = this.noLogs;
        return false;
      }
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }
  
}
