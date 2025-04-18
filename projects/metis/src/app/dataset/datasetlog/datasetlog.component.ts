import { NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { of, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent, ModalConfirmComponent, ModalConfirmService } from 'shared';

import { environment } from '../../../environments/environment';
import { isPluginCompleted, PluginExecution, SubTaskInfo } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';
import { LoadAnimationComponent } from '../../load-animation';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html',
  imports: [
    ModalConfirmComponent,
    NgIf,
    LoadAnimationComponent,
    NgFor,
    TranslatePipe,
    RenameWorkflowPipe
  ]
})
export class DatasetlogComponent extends DataPollingComponent implements OnInit {
  private readonly workflows = inject(WorkflowService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    super();
    this.noLogs = this.translate.instant('noLogs');
    this.noProcessedRecords = this.translate.instant('noProcessedRecords');
  }

  @Output() closed = new EventEmitter<void>();

  logMessages?: SubTaskInfo[];
  logPerStep = 100;
  subscription: Subscription;
  noLogs: string;
  noProcessedRecords: string;
  noLogMessage?: string;
  isFirstLoading = true;
  modalIdLog = 'modal-id-log';

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
    this.changeDetector.detectChanges();
    this.subs.push(
      this.modalConfirms.open(this.modalIdLog).subscribe(() => {
        this.closeLog();
      })
    );
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
            if (val < 1) {
              this.isFirstLoading = false;
              this.showWindowOutput(undefined, true);
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
      false,
      (result: SubTaskInfo[]) => {
        this.isFirstLoading = false;
        this.showWindowOutput(result);
      },
      (err: HttpErrorResponse): HttpErrorResponse | false => {
        this.isFirstLoading = false;
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
  showWindowOutput(log: SubTaskInfo[] | undefined, missingProcessedRecords = false): void {
    if (log && log.length === 0) {
      log = undefined;
    }
    if (log) {
      this.noLogMessage = undefined;
    } else if (missingProcessedRecords) {
      this.noLogMessage = this.noProcessedRecords;
    } else {
      this.noLogMessage = this.noLogs;
    }
    this.logMessages = log;
  }

  /** getLogFrom
  /* get the log pagination parameter
  */
  getLogFrom(logTo: number): number {
    let res = 1;
    if (logTo - this.logPerStep >= 1) {
      res = logTo - this.logPerStep + 1;
    }
    return res;
  }
}
