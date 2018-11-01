
import {timer as observableTimer, Observable} from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, TranslateService, ErrorService, AuthenticationService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss']
})
export class GeneralactionbarComponent implements OnInit {

  constructor(private workflows: WorkflowService,
    private translate: TranslateService,
    private authentication: AuthenticationService,
    private errors: ErrorService) { }

  @Input('datasetData') datasetData;
  @Input('lastExecutionData') lastExecutionData;
  @Input('workflowData') workflowData;
  activeSet: string;
  addWorkflow = false;
  statusCheck: number;
  displayWorkflowButton = false;
  workflowInfoAvailable = false;
  currentWorkflowStatus: string;
  currentPlugin: number;
  totalPlugins: number;
  pluginPercentage: number;
  subscription;
  intervalTimer: number = environment.intervalStatusShort;

  /** ngOnInit
  /*  init for this component
  /* set active dataset
  /* poll to check the status of this dataset + workflow history
  */
  ngOnInit() {
    if (!this.datasetData) { return false; }
    this.activeSet = this.datasetData.datasetId;
    this.checkStatus();

    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
    }
  }

  /** checkStatus
  /*  check status of current dataset: is there already workflow info
  /* is there already an execution (running or not)
  */
  checkStatus() {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.statusCheck = t;
      this.returnWorkflowInfo();
    });
  }

  /** returnWorkflowInfo
  /*  check if workflow info is already available
  */
  returnWorkflowInfo () {
    if (!this.datasetData || !this.authentication.validatedUser()) { return false; }
    const workflowinfo = this.workflowData;
    if (workflowinfo) {
      this.workflowInfoAvailable = true;
      this.returnLastExecution();
    } else {
      this.addWorkflow = true;
    }
    
    if (this.statusCheck > 1) { this.displayWorkflowButton = true; }
  }

  /** returnLastExecution
  /*  get the last action for this dataset and display its status in the progress/actionbar
  */
  returnLastExecution () {
    if (!this.datasetData) { return false; }
    const workflow = this.lastExecutionData;
    if (workflow) {
      this.currentWorkflowStatus = workflow['workflowStatus'];
      this.currentPlugin = this.workflows.getCurrentPlugin(workflow);
      this.totalPlugins = workflow.metisPlugins.length;
      this.pluginPercentage = (this.currentPlugin / this.totalPlugins) * 100;
    }
  }

  /** selectWorkflow
  /*  select the workflow, so it would be triggered
  */
  selectWorkflow() {
    this.workflows.selectWorkflow();
    if (this.subscription) { this.subscription.unsubscribe(); }
    this.checkStatus();
  }

}
