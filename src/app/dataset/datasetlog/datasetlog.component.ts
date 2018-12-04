import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { timer as observableTimer, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

import { WorkflowService, AuthenticationService, TranslateService, ErrorService } from '../../_services';
import { SubTaskInfo } from '../../_models/subtask-info';
import { ProcessingInfo } from '../dataset.component';
import { PluginExecution } from '../../_models/workflow-execution';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html'
})
export class DatasetlogComponent implements OnInit, OnDestroy {

  constructor(private workflows: WorkflowService,
    private authentication: AuthenticationService,
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input() showPluginLog: PluginExecution;
  @Input() processingInfo?: ProcessingInfo;

  @Output() closed = new EventEmitter<void>();

  logMessages?: SubTaskInfo[];
  logPerStep = 100;
  logStep = 1;
  logTo = this.logStep * this.logPerStep;
  subscription: Subscription;
  noLogs: string;
  noLogMessage?: string;

  ngOnInit(): void {
    this.startPolling();

    this.translate.use('en');
    this.noLogs = this.translate.instant('nologs');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeLog(): void {
    this.closed.emit(undefined);
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  startPolling(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, environment.intervalStatusMedium);
    this.subscription = timer.subscribe(() => {
      this.returnLog();
    });
  }

  returnLog(): void {
    const processed = this.showPluginLog.executionProgress.processedRecords;
    const status = this.showPluginLog.pluginStatus;

    this.logTo = (this.processingInfo ? this.processingInfo.totalProcessed : processed) || 0;

    if (processed && (status === 'FINISHED' || status === 'CANCELLED' || status === 'FAILED')) {
      if (this.subscription) { this.subscription.unsubscribe(); }
    }

    if (this.logTo <= 1) {
      this.showWindowOutput(undefined);
      return;
    }

    this.workflows.getLogs(this.showPluginLog.externalTaskId, this.showPluginLog.topologyName, this.getLogFrom(), this.logTo).subscribe(result => {
      this.showWindowOutput(result);
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  // show correct information in log modal window
  // this could be a "no logs found" message or the actual log
  showWindowOutput(log: SubTaskInfo[] | undefined): void {
    if (log && log.length === 0) {
      log = undefined;
    }
    this.noLogMessage = log ? undefined : this.noLogs;
    this.logMessages = log;
  }

  getLogFrom(): number {
    return (this.logTo - this.logPerStep) >= 1 ? (this.logTo - this.logPerStep) + 1 : 1;
  }
}
