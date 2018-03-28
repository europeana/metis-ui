import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';
import { StringifyHttpError } from '../../_helpers';

import { WorkflowService, AuthenticationService, ErrorService, TranslateService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(private workflows: WorkflowService,
      private http: HttpClient,
      private authentication: AuthenticationService,
      private errors: ErrorService, 
      private translate: TranslateService) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('datasetData') datasetData;
  allWorkflows;
  errorMessage;
  workflowPercentage: number = 0;
  subscription;
  intervalTimer = environment.intervalStatus;
  now;
  totalInDataset: number;
  totalProcessed: number = 0;
  currentStatus: any;
  currentWorkflow;
  currentWorkflowName;
  currentPlugin = 0; // pick the first one for now
  logMessages;
  isShowingWorkflowSelector: boolean = false;

  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** ngOnInit
  /* init for this component: 
  /* get most recently started execution
  /* get list of all workflows
  /* act when workflow changed
  /* set language to use for translations
  */
  ngOnInit() {
    
    this.returnLastExecution();

    if (typeof this.workflows.getWorkflows !== 'function') { return false }
    this.allWorkflows = this.workflows.getWorkflows();
    
    if (!this.workflows.changeWorkflow) { return false; }
    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {
          this.currentWorkflow = workflow;
          this.currentStatus = this.currentWorkflow['metisPlugins'][this.currentPlugin].pluginStatus;
          this.currentWorkflowName = this.currentWorkflow.workflowName;

          if (this.currentStatus !== 'FINISHED' || this.currentStatus !== 'CANCELLED' || this.currentStatus !== 'FAILED') {
            this.startPollingWorkflow();
          }
        } else {
          this.currentWorkflow = undefined;
        }
      }
    );

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
    
  }

  /** startPollingWorkflow
  /*  start a timer and start to check the status of a workflow
  */
  startPollingWorkflow() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.pollingWorkflow();
    });
  }

  /** pollingWorkflow
  /*  check the current status of a workflow
  */
  pollingWorkflow() {

    if (!this.datasetData) { return false }

    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(execution => {
      if (execution === 0 || !execution) {
        this.currentPlugin = 0; // pick the first one for now
        this.subscription.unsubscribe();
        this.workflows.setActiveWorkflow();
      } else {
        
        let e = execution;

        if (e['workflowStatus'] === 'FINISHED' || e['workflowStatus'] === 'CANCELLED' || e['workflowStatus'] === 'FAILED') {        
          this.currentPlugin = 0;
          this.now = e['finishedDate'];
          this.workflowPercentage = 0;

          if (e['workflowStatus'] === 'CANCELLED' || e['workflowStatus'] === 'FAILED') {
            this.now = e['updatedDate'];
          }

          this.subscription.unsubscribe();
          this.currentStatus = e['workflowStatus'];
          this.workflows.workflowDone(true);          
        } else {

          if (e['cancelling'] === false) {
            this.currentStatus = e['workflowStatus'];
          } else {
            this.currentStatus = 'CANCELLING';
          }

          this.totalProcessed = e['metisPlugins'][this.currentPlugin]['executionProgress'].processedRecords;
          this.totalInDataset = e['metisPlugins'][this.currentPlugin]['executionProgress'].expectedRecords;
            
          if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
            this.workflowPercentage = e['metisPlugins'][this.currentPlugin]['executionProgress'].progressPercentage;
          }

          if (e['updatedDate'] === null) {
            this.now = e['startedDate']; 
          } else {
            this.now = e['updatedDate']; 
          }
        }
      }
            
    });

  };

  /** returnLastExecution
  /*  get the last action for this dataset and display its status in the progress/actionbar
  */
  returnLastExecution () {
    if (!this.datasetData) { return false }
    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(workflow => {
      if (workflow) {
        this.currentWorkflow = workflow;
        this.currentWorkflowName = this.currentWorkflow.workflowName;
        this.currentStatus = this.currentWorkflow['metisPlugins'][this.currentPlugin].pluginStatus;
        if (this.currentStatus !== 'FINISHED' && this.currentStatus !== 'CANCELLED' && this.currentStatus !== 'FAILED') { 
          this.startPollingWorkflow();
        }
      }
    });
  }

  /** cancelWorkflow
  /*  cancel a running execution
  /* using id of current workflow
  */
  cancelWorkflow () {    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** showLog
  /*  show the log for the current/last execution
  */
  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

  /** openWorkflowSelector
  /*  open up the workflow selector, now working with fixed values
  */
  openWorkflowSelector() {
    if (this.isShowingWorkflowSelector === false) {
      this.isShowingWorkflowSelector = true;
    } else {
      this.isShowingWorkflowSelector = false;
    }
  }

  /** selectWorkflow
  /*  select a workflow from the dropdownlist
  /* @param {string} workflow - selected workflow
  */
  selectWorkflow(workflow) {
    this.workflows.selectWorkflow(workflow);
    this.openWorkflowSelector();
  }

  /** onClickedOutsideWorkflow
  /*  close workflow selector
  /* @param {any} e - event, optional
  */  
  onClickedOutsideWorkflow(e?) {
    this.isShowingWorkflowSelector = false;
  }
}
