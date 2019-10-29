import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { timer as observableTimer, Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { isPluginCompleted, PluginExecution, SubTaskInfo } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html'
})
export class DatasetlogComponent implements OnInit, OnDestroy {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly translate: TranslateService
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
      const diffProcessedCount: boolean =
        value.executionProgress !== undefined &&
        old.executionProgress !== undefined &&
        value.executionProgress.processedRecords !== old.executionProgress.processedRecords;
      // compare old and new for changes
      changed =
        value.externalTaskId !== old.externalTaskId ||
        value.pluginStatus !== old.pluginStatus ||
        diffProcessedCount;
    }

    this._showPluginLog = value;

    if (changed) {
      // re-commence polling if data changed
      this.startPolling();
    }
  }

  /** showPluginLog
  /* accessor for private _showPluginLog variable
  */
  get showPluginLog(): PluginExecution {
    return this._showPluginLog;
  }

  /** ngOnInit
  /* prepare translated message
  */
  ngOnInit(): void {
    this.noLogs = this.translate.instant('nologs');
  }

  /** ngOnDestroy
  /* unsubscribe
  */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /** closeLog
  /* emit the closed event
  /* unsubscribe from data source
  */
  closeLog(): void {
    this.closed.emit();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /** startPolling
  /* start polling the log data
  */
  startPolling(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const timer = observableTimer(0, environment.intervalStatusMedium);
    this.subscription = timer.subscribe(() => {
      this.returnLog();
    });
  }

  /** returnLog
  /* subscribe to the logs and show
  */
  returnLog(): void {
    const processed =
      this.showPluginLog.executionProgress && this.showPluginLog.executionProgress.processedRecords;

    this.logTo = processed || 0;

    if (processed && isPluginCompleted(this.showPluginLog) && this.subscription) {
      // unsubscribe if done
      this.subscription.unsubscribe();
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
        this.logTo
      )
      .subscribe(
        (result) => {
          this.isFirstLoading = false;
          this.showWindowOutput(result);
        },
        (err: HttpErrorResponse) => {
          this.isFirstLoading = false;
          this.errors.handleError(err);
        }
      );
  }

  /** showWindowOutput
  /* show correct information in log modal window
  /* this could be a "no logs found" message or the actual log
  */
  showWindowOutput(log: SubTaskInfo[] | undefined): void {
    if (log && log.length === 0) {
      log = undefined;
    }
    this.noLogMessage = log ? undefined : this.noLogs;
    this.logMessages = log;
  }

  /** getLogFrom
  /* get the log pagination parameter
  */
  getLogFrom(): number {
    return this.logTo - this.logPerStep >= 1 ? this.logTo - this.logPerStep + 1 : 1;
  }
}
