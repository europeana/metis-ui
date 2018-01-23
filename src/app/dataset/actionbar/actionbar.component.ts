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
  currentStatus: string;
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
        let timer = Observable.timer(0, this.intervalTimer);
        this.subscription = timer.subscribe(t => {
          this.pollingWorkflow(this.currentWorkflow.id);
        });
      }
    );

  }

  pollingWorkflow(id) {
    this.workflows.getWorkflowStatus(id).subscribe(execution => {

      if (execution['metisPlugins'][this.currentPlugin].pluginStatus === null) {
        this.currentStatus = execution['workflowStatus'];
      } else {
        this.currentStatus = execution['metisPlugins'][this.currentPlugin].pluginStatus;
      }

      this.currentWorkflowName = execution['metisPlugins'][this.currentPlugin].pluginType;
      this.totalProcessed = execution['metisPlugins'][this.currentPlugin]['executionProgress'].processedRecords;
      this.totalInDataset = execution['metisPlugins'][this.currentPlugin]['executionProgress'].expectedRecords;
        
      if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
       this.workflowPercentage = (this.totalProcessed / this.totalInDataset) * 100;
      }

      if (execution['updatedDate'] === null) {
        this.now = execution['startedDate']; 
      } else {
        this.now = execution['updatedDate']; 
      }
      
      if (this.currentStatus === 'FINISHED') {
        /*if (this.currentPlugin < execution['metisPlugins'].length - 1) {
          this.currentPlugin += 1;
        } else {*/
          this.currentPlugin = 0;
          this.now = execution['finishedDate'];
          this.subscription.unsubscribe();
       /*}*/
      }
    });

  };

  getRunningExecution () {
    //this.workflows.getWorkflowStatus(this.currentWorkflow.id).subscribe(execution => {
    //  console.log(execution['workflowStatus']);
    //});
  }

  cancelWorkflow () {
    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
      this.subscription.unsubscribe();
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
