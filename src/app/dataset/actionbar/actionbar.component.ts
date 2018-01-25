import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Rx';

import { WorkflowService, AuthenticationService } from '../../_services';

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
      private router: Router) { }

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


  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
    
    this.getRunningExecution();

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        this.currentWorkflow = workflow;
        this.currentStatus = this.currentWorkflow.workflowStatus;
        this.currentWorkflowName = this.currentWorkflow.workflowName;

        if (this.currentStatus !== 'FINISHED' || this.currentStatus !== 'CANCELLED') {
          this.startPollingWorkflow();
        }
      }
    );

  }

  startPollingWorkflow() {
    console.log('startPollingWorkflow');
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.pollingWorkflow();
    });
  }

  pollingWorkflow() {

    this.workflows.getRunningWorkflows(this.datasetData.datasetId).subscribe(execution => {

      let e = execution[0];
      console.log('pollingWorkflow', e);

      if (this.currentStatus === 'FINISHED' || this.currentStatus === 'CANCELLED') {
      //   /*if (this.currentPlugin < e['metisPlugins'].length - 1) {
      //     this.currentPlugin += 1;
      //   } else {*/
        this.currentPlugin = 0;
        this.now = e['finishedDate'];
        this.subscription.unsubscribe();
      //  /*}*/
      }

      if (e['metisPlugins'][this.currentPlugin].pluginStatus === null) {
        this.currentStatus = e['workflowStatus'];
      } else {
        this.currentStatus = e['metisPlugins'][this.currentPlugin].pluginStatus;
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
      
    });

  };

  getRunningExecution () {
    console.log('getRunningExecution');
    // either running or inqueue
    this.workflows.getRunningWorkflows(this.datasetData.datasetId).subscribe(workflow => {
      for (let w of workflow) {
        this.currentWorkflow = w;
        this.currentStatus = this.currentWorkflow.workflowStatus;
        this.startPollingWorkflow();
      }
    });
  }

  cancelWorkflow () {
    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
      this.subscription.unsubscribe();
      this.currentWorkflow = result;
    },(err: HttpErrorResponse) => {
      if (err.status === 401 || err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }
    });

  }

  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

  returnLog() {
    this.workflows.getLogs().subscribe(result => {
      this.logMessages = result;
    },(err: HttpErrorResponse) => {
      if (err.status === 401 || err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }
    });
  }

}
