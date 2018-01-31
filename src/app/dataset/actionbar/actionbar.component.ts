import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';
import { StringifyHttpError } from '../../_helpers';

import { WorkflowService, AuthenticationService, ErrorService } from '../../_services';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(private route: ActivatedRoute, 
      private workflows: WorkflowService,
      private http: HttpClient,
      private authentication: AuthenticationService,
      private router: Router,
      private errors: ErrorService) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('datasetData') datasetData;
  allWorkflows;
  errorMessage;
  workflowPercentage: number = 0;
  subscription;
  intervalTimer = 500;
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

          if (this.currentStatus !== 'FINISHED' || this.currentStatus !== 'CANCELLED') {
            this.startPollingWorkflow();
          }
        } else {
          this.currentWorkflow = undefined;
        }
      }
    );

  }

  /* startPollingWorkflow
    start a timer and start to check the status of a workflow
  */
  startPollingWorkflow() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.pollingWorkflow();
    });
  }

  /* pollingWorkflow
    check the current status of a workflow
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

        if (e['metisPlugins'][this.currentPlugin].pluginStatus === 'FINISHED' || e['metisPlugins'][this.currentPlugin].pluginStatus === 'CANCELLED') {        
          this.currentPlugin = 0;
          this.now = e['finishedDate'];

          if (e['metisPlugins'][this.currentPlugin].pluginStatus === 'CANCELLED') {
            this.now = e['updatedDate'];
          }

          this.subscription.unsubscribe();
          this.currentStatus = e['metisPlugins'][this.currentPlugin].pluginStatus;
          this.workflows.workflowDone(true);          
        } else {

          if (e['cancelling'] === false) {
            this.currentStatus = e['metisPlugins'][this.currentPlugin].pluginStatus;
          } else {
            this.currentStatus = 'CANCELLING';
          }

          this.totalProcessed = e['metisPlugins'][this.currentPlugin]['executionProgress'].processedRecords;
          this.totalInDataset = e['metisPlugins'][this.currentPlugin]['executionProgress'].expectedRecords;
            
          if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
            this.workflowPercentage = (this.totalProcessed / this.totalInDataset) * 100;
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

  /* returnLastExecution
    get the last action for this dataset and display its status in the progress/actionbar
  */
  returnLastExecution () {
    if (!this.datasetData) { return false }
    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(workflow => {
      if (workflow) {
        this.currentWorkflow = workflow;
        this.currentWorkflowName = this.currentWorkflow.workflowName;
        this.currentStatus = this.currentWorkflow['metisPlugins'][this.currentPlugin].pluginStatus;
        this.startPollingWorkflow();
      }
    });
  }

  /* cancelWorkflow
    cancel a running execution
  */
  cancelWorkflow () {    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /* showLog
    show the log for the current/last execution
  */
  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

  /* returnLog
    get the actual logs and make them available for display in the log modal window
  */
  returnLog() {
    this.workflows.getLogs().subscribe(result => {
      this.logMessages = result;
    },(err: HttpErrorResponse) => {
      this.errors.handleError(err);  
    });
  }

  /* openWorkflowSelector
    open up the workflow selector, now working with fixed values
  */
  openWorkflowSelector() {
    if (this.isShowingWorkflowSelector === false) {
      this.isShowingWorkflowSelector = true;
    } else {
      this.isShowingWorkflowSelector = false;
    }
  }

  /* selectWorkflow
    select a workflow from the dropdownlist
  */
  selectWorkflow(workflow) {
    this.workflows.selectWorkflow(workflow);
    this.openWorkflowSelector();
  }

}
