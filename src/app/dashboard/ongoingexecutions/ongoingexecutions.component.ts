import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Observable } from 'rxjs/Rx';

import { WorkflowService, ErrorService, TranslateService, DatasetsService } from '../../_services';

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
  @Input('isShowingLog') isShowingLog: any;

  ongoingExecutions;
  errorMessage;
  subscription;
  intervalTimer = 5000;
  currentPlugin: number = 0;
  cancelling;
  datasetNames: Array<any> = [];
  viewMore: boolean = false;


  ngOnInit() {
    this.startPolling();
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.cancelling = this.translate.instant('cancelling');
    }

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }    
  }

  /* startPolling
    check for ongoing executions
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
      this.ongoingExecutions = this.datasets.addDatasetNameToExecution(executions['results']);
      if (executions['nextPage'] > 0) {
        this.viewMore = true;
      }
    });
  }

  /* cancelWorkflow
    start cancellation of the dataset with id
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

  /* showLog
    show the log for the current/last execution
  */
  showLog(externaltaskId, topology) {
    let message = {'externaltaskId' : externaltaskId, 'topology' : topology};
    this.notifyShowLogStatus.emit(message);
  }

  /* viewAll
    scrolls to top of all executions table  / top of page
  */
  viewAll() {
    window.scrollTo(0, 0);
  }

}
