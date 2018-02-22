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

  ongoingFirst;
  ongoing;
  errorMessage;
  subscription;
  intervalTimer = 2000;
  currentPlugin: number = 0;
  cancelling;
  datasetNames: Array<any> = [];

  ngOnInit() {
    this.startPolling();
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.cancelling = this.translate.instant('cancelling');
    }
  }

  startPolling() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoing();
    });
  }

  getOngoing() {
    this.workflows.getOngoingExecutionsPerOrganisation().subscribe(executions => {
      this.addDatasetInfo(executions);
    });
  }

  addDatasetInfo(executions) {
    for (let i = 0; i < executions.length; i++) {
      if (this.datasetNames[executions[i].datasetId]) {
        executions[i].datasetName = this.datasetNames[executions[i].datasetId];
      } else {    
        this.datasets.getDataset(executions[i].datasetId).subscribe(result => {
          this.datasetNames[executions[i].datasetId] = result['datasetName'];
          executions[i].datasetName = result['datasetName'];
        },(err: HttpErrorResponse) => {
          this.errors.handleError(err);   
        });
      }
    }
    this.ongoingFirst = executions.slice(0, 1)[0];
    this.ongoing = executions.slice(1);
  }

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

}
