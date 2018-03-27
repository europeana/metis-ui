import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Observable } from 'rxjs/Rx';

import { WorkflowService, ErrorService, TranslateService, DatasetsService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss']
})
export class OngoingexecutionsComponent {

  constructor(private workflows: WorkflowService, 
    private errors: ErrorService,
    private translate: TranslateService,
    private datasets: DatasetsService) { }

  @Output() notifyShowLogStatus: EventEmitter<any> = new EventEmitter<any>();
  @Input('isShowingLog') isShowingLog;

  ongoingExecutions;
  ongoingExecutionsTotal: number;
  errorMessage;
  subscription;
  intervalTimer = environment.intervalStatus;
  currentPlugin: number = 0;
  cancelling;
  datasetNames: Array<any> = [];
  viewMore: boolean = false;

  /** ngOnInit
  /* init of this component: 
  /* start polling/checking for updates
  /* set translation languages
  /* translate some values to use in this component
  */
  ngOnInit() {
    this.startPolling();
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.cancelling = this.translate.instant('cancelling');
    } 
  }

  /** startPolling
  /*  check for ongoing executions
  */
  startPolling() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoing();
    });
  }

  /** getOngoing
  /*  get ongoing executions, either in queue or running, most recent started
  /*  showing up to 5 executions
  */
  getOngoing() {
    this.workflows.getAllExecutionsPerOrganisation(0, true).subscribe(executions => {
      if (this.ongoingExecutionsTotal != executions['listSize'] && this.ongoingExecutionsTotal) {
        this.workflows.ongoingExecutionDone(true);
      }
      this.ongoingExecutions = this.datasets.addDatasetNameToExecution(executions['results']);
      this.ongoingExecutionsTotal = executions['listSize'];
      if (executions['nextPage'] > 0) {
        this.viewMore = true;
      } else {
        this.viewMore = false;
      }
    });
  }

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id) {
    if (!id) { return false; }
    this.getOngoing();
    this.workflows.cancelThisWorkflow(id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** showLog
  /*  show the log for the current/last execution
  /* @param {number} externaltaskId - id of the external task that belongs to topology/plugin
  /* @param {string} topology - name of the topology
  */
  showLog(externaltaskId, topology) {
    let message = {'externaltaskId' : externaltaskId, 'topology' : topology};
    this.notifyShowLogStatus.emit(message);
  }

  /** viewAll
  /*  scrolls to top of all executions table/top of page
  */
  viewAll() {
    window.scrollTo(0, 0);
  }

}
