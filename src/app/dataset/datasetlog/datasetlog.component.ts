import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {timer as observableTimer, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

import { WorkflowService, AuthenticationService, TranslateService, ErrorService } from '../../_services';
import { LogStatus } from '../../_models/log-status';
import { SubTaskInfo } from '../../_models/subtask-info';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html'
})
export class DatasetlogComponent implements OnInit {

  constructor(private workflows: WorkflowService,
    private authentication: AuthenticationService,
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input('isShowingLog') isShowingLog: LogStatus;
  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  logMessages?: SubTaskInfo[];
  logPerStep = 100;
  logStep = 1;
  logFrom = 1;
  logTo = this.logStep * this.logPerStep;
  logPlugin: string;
  subscription: Subscription;
  intervalTimer = environment.intervalStatus;
  noLogs: string;
  noLogMessage?: string;


  /** ngOnInit
  /* init for this specific component
  /* return the log information
  /* and set translation langugaes
  */
  ngOnInit(): void {
    this.startPolling();

    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
      this.noLogs = this.translate.instant('nologs');
    }
  }

  /** closeLog
  /* close log modal window
  */
  closeLog(): void {
    this.notifyShowLogStatus.emit(false);
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /** startPolling
  /*  check for new logs
  */
  startPolling(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.returnLog();
    });
  }

  /** returnLog
  /* get content of log, based on external taskid and topology
  */
  returnLog(): void {

    const currentProcessed = this.workflows.getCurrentProcessed();
    this.logTo = (currentProcessed ? currentProcessed.processed : this.isShowingLog.processed) || 0;
    this.logPlugin = currentProcessed ? currentProcessed.topology : this.isShowingLog.plugin;

    if (this.isShowingLog['processed'] && (this.isShowingLog['status'] === 'FINISHED' || this.isShowingLog['status'] === 'CANCELLED' || this.isShowingLog['status'] === 'FAILED')) {
      if (this.subscription) { this.subscription.unsubscribe(); }
    }

    if (this.logTo <= 1) {
      this.showWindowOutput(this.noLogs, undefined);
      return;
    }

    this.workflows.getLogs(this.isShowingLog['externaltaskId'], this.isShowingLog['topology'], this.getLogFrom(), this.logTo).subscribe(result => {
      if (result && (<any>result).length > 0) {
        this.showWindowOutput(undefined, result);
      } else {
        this.showWindowOutput(this.noLogs, undefined);
      }
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  /** showWindowOutput
  /* show correct information in log modal window
  /* this good be a "no logs found" message or the actual log
  */
  showWindowOutput(nolog: string | undefined, log: SubTaskInfo[] | undefined): void {
    this.noLogMessage = nolog;
    this.logMessages = log;
  }

  /** getLogFrom
  /* calculate from
  /* used to get logs
  */
  getLogFrom(): number {
    return (this.logTo - this.logPerStep) >= 1 ? (this.logTo - this.logPerStep) + 1 : 1;
  }
}
