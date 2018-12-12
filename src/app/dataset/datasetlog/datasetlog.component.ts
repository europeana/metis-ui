import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription, timer as observableTimer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PluginExecution, SubTaskInfo } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html',
})
export class DatasetlogComponent implements OnInit, OnDestroy {
  constructor(
    private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService,
  ) {}

  @Output() closed = new EventEmitter<void>();

  logMessages?: SubTaskInfo[];
  logPerStep = 100;
  logStep = 1;
  logTo = this.logStep * this.logPerStep;
  subscription: Subscription;
  noLogs: string;
  noLogMessage?: string;
  isFirstLoading = true;

  private _showPluginLog: PluginExecution;

  @Input()
  set showPluginLog(value: PluginExecution) {
    const old = this._showPluginLog;
    let changed = true;
    if (old) {
      changed =
        value.externalTaskId !== old.externalTaskId ||
        value.pluginStatus !== old.pluginStatus ||
        value.executionProgress.processedRecords !== old.executionProgress.processedRecords;
    }

    this._showPluginLog = value;

    if (changed) {
      this.startPolling();
    }
  }

  get showPluginLog(): PluginExecution {
    return this._showPluginLog;
  }

  ngOnInit(): void {
    this.translate.use('en');
    this.noLogs = this.translate.instant('nologs');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeLog(): void {
    this.closed.emit();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  startPolling(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const timer = observableTimer(0, environment.intervalStatusMedium);
    this.subscription = timer.subscribe(() => {
      this.returnLog();
    });
  }

  returnLog(): void {
    const processed = this.showPluginLog.executionProgress.processedRecords;
    const status = this.showPluginLog.pluginStatus;

    this.logTo = processed || 0;

    if (processed && (status === 'FINISHED' || status === 'CANCELLED' || status === 'FAILED')) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    if (this.logTo <= 1) {
      this.isFirstLoading = false;
      this.showWindowOutput(undefined);
      return;
    }

    this.workflows
      .getLogs(
        this.showPluginLog.externalTaskId,
        this.showPluginLog.topologyName,
        this.getLogFrom(),
        this.logTo,
      )
      .subscribe(
        (result) => {
          this.isFirstLoading = false;
          this.showWindowOutput(result);
        },
        (err: HttpErrorResponse) => {
          this.isFirstLoading = false;
          this.errors.handleError(err);
        },
      );
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
    return this.logTo - this.logPerStep >= 1 ? this.logTo - this.logPerStep + 1 : 1;
  }
}
