import {timer as observableTimer, Observable} from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, ErrorService, TranslateService, DatasetsService, AuthenticationService } from '../../_services';
import { environment } from '../../../environments/environment';
import { LogStatus } from '../../_models/log-status';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss']
})
export class OngoingexecutionsComponent {

  constructor(private workflows: WorkflowService,
    private errors: ErrorService,
    private authentication: AuthenticationService,
    private translate: TranslateService,
    private datasets: DatasetsService) { }

  @Output() notifyShowLogStatus: EventEmitter<LogStatus> = new EventEmitter<LogStatus>();
  @Input('isShowingLog') isShowingLog: LogStatus;
  @Input('runningExecutionDataOutput') ongoingExecutionDataOutput;

  ongoingExecutions;
  ongoingExecutionsTotal: number;
  errorMessage;
  subscription;
  intervalTimer = environment.intervalStatusShort;
  cancelling;
  currentPlugin = 0;
  datasetNames: Array<any> = [];
  viewMore = false;
  logIsOpen;
  contentCopied = false;

  /** ngOnInit
  /* init of this component:
  /* start polling/checking for updates
  /* set translation languages
  /* translate some values to use in this component
  */
  ngOnInit() {
    this.startPolling();
    if (!this.datasets.updateLog) { return; }
    this.datasets.updateLog.subscribe(
      log => {
        if (this.isShowingLog) {
          this.showLog(log['externaltaskId'], log['topology'], log['plugin'], this.logIsOpen, log['processed'], log['status']);
        } else {
          this.logIsOpen = undefined;
        }
    });

    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
      this.cancelling = this.translate.instant('cancelling');
    }
  }

  /** startPolling
  /*  check for ongoing executions
  */
  startPolling() {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoing();
    });
  }

  /** getOngoing
  /*  get ongoing executions, either in queue or running, most recent started
  /*  showing up to 5 executions
  */
  getOngoing() {
    if (!this.authentication.validatedUser()) { return; }

    const executions = this.ongoingExecutionDataOutput;
    const max = 5;
    if (!executions) { return; }

    this.ongoingExecutions = this.datasets.addDatasetNameAndCurrentPlugin(executions.slice(0, max), this.logIsOpen);
    if (executions.length > max) {
      this.viewMore = true;
    } else {
      this.viewMore = false;
    }
  }

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id) {
    if (!id) { return; }
    this.getOngoing();
    this.workflows.promptCancelThisWorkflow(id);
  }

  /** showLog
  /*  show the log for the current/last execution
  /* @param {number} externaltaskId - id of the external task that belongs to topology/plugin
  /* @param {string} topology - name of the topology
  */
  showLog(externaltaskId, topology, plugin, datasetId?, processed?, status?) {
    const message = {'externaltaskId' : externaltaskId, 'topology' : topology, 'plugin': plugin, 'processed': processed, 'status': status};
    this.logIsOpen = datasetId;
    this.notifyShowLogStatus.emit(message);
  }

  /** viewAll
  /*  scrolls to top of all executions table/top of page
  */
  viewAll() {
    window.scrollTo(0, 0);
  }

  /*** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation (type, id1, id2) {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

}
