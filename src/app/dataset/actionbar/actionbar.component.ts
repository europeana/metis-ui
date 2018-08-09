
import {timer as observableTimer} from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs';
import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, AuthenticationService, ErrorService, TranslateService, DatasetsService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(public workflows: WorkflowService,
      public datasets: DatasetsService,
      private http: HttpClient,
      private authentication: AuthenticationService,
      private errors: ErrorService, 
      private translate: TranslateService) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('datasetData') datasetData;
  errorMessage;
  workflowPercentage: number = 0;
  subscription;
  intervalTimer = environment.intervalStatus;
  now;
  totalInDataset: number;
  totalProcessed: number = 0;
  currentStatus: any;
  currentWorkflow;
  currentPluginName;
  currentExternalTaskId;
  currentTopology;
  currentPlugin = 0; // pick the first one for now
  logMessages;
  isShowingWorkflowSelector: boolean = false;
  workflowInfoAvailable: boolean = false;
  logIsOpen: boolean = false;
  contentCopied: boolean = false;

  @Output() notifyShowLogStatus: EventEmitter<any> = new EventEmitter<any>();

  /** ngOnInit
  /* init for this component: 
  /* get most recently started execution
  /* act when workflow changed
  /* set language to use for translations
  */
  ngOnInit() {
    
    this.returnLastExecution();
    this.returnWorkflowInfo();
     
    if (!this.workflows.changeWorkflow) { return false; }
    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {
          this.currentWorkflow = workflow;
          this.currentPlugin = this.workflows.getCurrentPlugin(this.currentWorkflow);

          let thisPlugin = this.currentWorkflow['metisPlugins'][this.currentPlugin];

          this.currentStatus = thisPlugin.pluginStatus;
          this.currentPluginName = thisPlugin.pluginType;
          this.currentExternalTaskId = thisPlugin.externalTaskId;
          this.currentTopology = thisPlugin.topologyName;

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

  /** returnWorkflowInfo
  /*  check if workflow info is already available
  */
  returnWorkflowInfo () {
    if (!this.datasetData || !this.authentication.validatedUser()) { return false }
    this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflowinfo => {
      if (workflowinfo) {
        this.workflowInfoAvailable = true;
      } 
    }, (err: HttpErrorResponse) => {
      if (this.subscription) { this.subscription.unsubscribe(); }
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** startPollingWorkflow
  /*  start a timer and start checking the status of a workflow
  */
  startPollingWorkflow() {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.pollingWorkflow();
    });
  }

  /** pollingWorkflow
  /*  check the current status of a workflow
  */
  pollingWorkflow() {

    if (!this.datasetData || !this.authentication.validatedUser()) { return false }

    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(execution => {

      if (execution === 0 || !execution) {
        this.currentPlugin = 0;
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

          if (!this.currentWorkflow['metisPlugins'][this.currentPlugin]) { return false; }
          
          if (this.currentPlugin !== this.workflows.getCurrentPlugin(e)) {
            this.workflows.updateHistory(e);
            let t = this.workflows.getCurrentPlugin(e);
            if (this.isShowingLog) {
              this.showLog(e['metisPlugins'][t].externalTaskId, e['metisPlugins'][t].topologyName, e['metisPlugins'][t].pluginType, e['metisPlugins'][t]['executionProgress'].processedRecords, e['metisPlugins'][t].pluginStatus);
            }
          }

          this.currentPlugin = this.workflows.getCurrentPlugin(e);
          let thisPlugin = e['metisPlugins'][this.currentPlugin];

          this.workflowPercentage = 0;
          this.currentPluginName = this.currentWorkflow['metisPlugins'][this.currentPlugin].pluginType;
          this.currentStatus = e['cancelling'] === false ? thisPlugin.pluginStatus : 'CANCELLING';

          this.currentExternalTaskId = thisPlugin.externalTaskId;
          this.currentTopology = thisPlugin.topologyName;
          this.totalProcessed = thisPlugin['executionProgress'].processedRecords;
          this.totalInDataset = thisPlugin['executionProgress'].expectedRecords;
          this.workflows.setCurrentProcessed(this.totalProcessed, this.currentPluginName);

          if (this.totalProcessed !== 0 && this.totalInDataset !== 0) {
            this.workflowPercentage = thisPlugin['executionProgress'].progressPercentage;
          }

          this.now = e['updatedDate'] === null ? thisPlugin['startedDate'] : thisPlugin['updatedDate'];
        }
      }            
    }, (err: HttpErrorResponse) => {
      if (this.subscription) { this.subscription.unsubscribe(); }
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
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
        this.currentPlugin = this.workflows.getCurrentPlugin(this.currentWorkflow);
        
        let thisPlugin = this.currentWorkflow['metisPlugins'][this.currentPlugin];
        this.currentStatus = thisPlugin ? thisPlugin.pluginStatus : '-';
        this.currentPluginName = thisPlugin ? thisPlugin.pluginType : '-';
        this.currentExternalTaskId = thisPlugin.externalTaskId;
        this.currentTopology = thisPlugin.topologyName;
        this.totalProcessed = thisPlugin['executionProgress'].processedRecords;
        
        if (this.currentStatus !== 'FINISHED' && this.currentStatus !== 'CANCELLED' && this.currentStatus !== 'FAILED') { 
          this.startPollingWorkflow();
        }
      }
    }, (err: HttpErrorResponse) => {
      if (this.subscription) { this.subscription.unsubscribe(); }
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** cancelWorkflow
  /*  cancel a running execution
  /* using id of current workflow
  */
  cancelWorkflow () {    
    this.workflows.cancelThisWorkflow(this.currentWorkflow.id).subscribe(result => {
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** showLog
  /*  show the log for the current/last execution
  */
  showLog(taskid, topology, plugin, processed, status) {
    let message = {'externaltaskId' : taskid, 'topology' : topology, 'plugin': plugin, 'processed': processed, 'status': status };
    this.notifyShowLogStatus.emit(message);
  }

  /** selectWorkflow
  /*  select the workflow, so it would be triggered
  */
  selectWorkflow() {
    this.workflows.selectWorkflow();
  }

  /** copyInformation
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
