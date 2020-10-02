import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPluginCompleted, PluginExecution, SubTaskInfo } from '../../_models';

import { DataPollingComponent } from '../../data-polling';

import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html'
})
export class DatasetlogComponent extends DataPollingComponent implements OnInit {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly errors: ErrorService,
    private readonly translate: TranslateService
  ) {
    super();
  }

  @Output() closed = new EventEmitter<void>();

  logMessages?: SubTaskInfo[];
  logPerStep = 100;
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
    this.noLogs = this.translate.instant('noLogs');
  }

  /** closeLog
  /* emit the closed event
  /* unsubscribe from data source
  */
  closeLog(): void {
    this.closed.emit();
    this.cleanup();
  }

  /** startPolling
  /* - unsubscribe from previous subscription
  /* - start polling the log data
  */
  startPolling(): void {
    this.cleanup();

    this.createNewDataPoller(
      environment.intervalStatusMedium,
      () => {
        return of(this.getProcessedCount()).pipe(
          map((val) => {
            if (isPluginCompleted(this.showPluginLog) && this.subs.length > 0) {
              this.cleanup();
              return 0;
            }
            if (val <= 1) {
              this.isFirstLoading = false;
              this.showWindowOutput(undefined);
              return 0;
            }
            return val;
          }),
          filter((val) => {
            return val > 0;
          }),
          switchMap((val: number) => {
            return this.workflows.getLogs(
              this.showPluginLog.externalTaskId,
              this.showPluginLog.topologyName,
              this.getLogFrom(val),
              val
            );
          })
        );
      },
      (result: SubTaskInfo[]) => {
        this.isFirstLoading = false;
        this.showWindowOutput(result);
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        this.isFirstLoading = false;
        this.errors.handleError(err);
        this.cleanup();
        return err;
      }
    );
  }

  getProcessedCount(): number {
    const prg = this.showPluginLog.executionProgress;
    return prg ? prg.processedRecords : 0;
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
  getLogFrom(logTo: number): number {
    return logTo - this.logPerStep >= 1 ? logTo - this.logPerStep + 1 : 1;
  }
}
