import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';

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
  workflowPercentage: number = 0;
  subscription;
  intervalTimer = 500;
  now;
  totalInDataset: number;
  totalProcessed: number = 0;
  currentStatus: any;
  currentWorkflow;
  currentWorkflowName;
  currentPlugin = 0;
  logMessages;
  isShowingWorkflowSelector: boolean = false;

  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
    
    this.getLastExecution();

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {
          this.currentWorkflow = workflow;
          this.currentStatus = this.currentWorkflow.workflowStatus;
          this.currentWorkflowName = this.currentWorkflow.workflowName;

          if (this.currentStatus !== 'FINISHED' || this.currentStatus !== 'CANCELLED') {
            this.startPollingWorkflow();
          }
        } else {
          this.currentWorkflow = '';
        }
      }
    );

  }

  startPollingWorkflow() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.pollingWorkflow();
    });
  }

  pollingWorkflow() {

    this.workflows.getLastWorkflow(this.datasetData.datasetId).subscribe(execution => {

      if (execution === 0) {
        this.currentPlugin = 0;
        this.subscription.unsubscribe();
        this.workflows.setActiveWorkflow();
      } else {
        
        let e = execution;

        if (e['workflowStatus'] === 'FINISHED' || e['workflowStatus'] === 'CANCELLED') {        
          this.currentPlugin = 0;
          this.now = e['finishedDate'];
          this.subscription.unsubscribe();
          this.currentStatus = e['workflowStatus'];
          this.workflows.workflowDone(true);          
        } else {

          if (e['cancelling'] === false) {
            if (e['metisPlugins'][this.currentPlugin].pluginStatus === null) {
              this.currentStatus = e['workflowStatus'];
            } else {
              this.currentStatus = e['metisPlugins'][this.currentPlugin].pluginStatus;
            }
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

  getLastExecution () {
    this.workflows.getLastWorkflow(this.datasetData.datasetId).subscribe(workflow => {
      if (workflow) {
        this.currentWorkflow = workflow;
        this.currentWorkflowName = this.currentWorkflow.workflowName;
        this.currentStatus = this.currentWorkflow.workflowStatus;
        this.startPollingWorkflow();
      }
    });
  }

  cancelWorkflow () {    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      this.errors.handleError(err);   
    });
  }

  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

  returnLog() {
    this.workflows.getLogs().subscribe(result => {
      this.logMessages = result;
    },(err: HttpErrorResponse) => {
      this.errors.handleError(err);   
    });
  }

  openWorkflowSelector() {
    if (this.isShowingWorkflowSelector === false) {
      this.isShowingWorkflowSelector = true;
    } else {
      this.isShowingWorkflowSelector = false;
    }
  }

  selectWorkflow(workflow) {
    this.workflows.selectWorkflow(workflow);
    this.openWorkflowSelector();
  }

}
