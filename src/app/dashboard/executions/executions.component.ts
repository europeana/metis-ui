import {timer as observableTimer, Observable} from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, ErrorService, TranslateService, DatasetsService, AuthenticationService } from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-executions',
  templateUrl: './executions.component.html',
  styleUrls: ['./executions.component.scss']
})
export class ExecutionsComponent implements OnInit {

  constructor(private workflows: WorkflowService, 
    private errors: ErrorService,
    private translate: TranslateService,
    private authentication: AuthenticationService,
    private datasets: DatasetsService) { }

  @Input('ongoingExecutionDataOutput') ongoingExecutionDataOutput;

  allExecutions:Array<any> = [];
  ongoingExecutions: Array<any> = [];
  ongoingExecutionsOutput: Array<any> = [];
  ongoingExecutionsCurrentTotal: number = 0;
  ongoingExecutionDone: boolean = false;
  currentPage: number = 0;
  nextPage: number = 0;
  nextPageOngoing: number = 0;
  gotoNextPage: number = 0;
  pollingTimeout;
  intervalTimer: number = environment.intervalStatus;
  totalPagesShowing: number = 0;
  errorMessage: string;
  successMessage: string;
  allWorkflows: any;
  contentCopied: boolean = false;
  subscription;

  /** ngOnInit
  /* init this component:
  /* set translation language,
  /* get all workflows for use in filter
  /* start polling, checking for updates
  */
  ngOnInit() {
  	if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }  

    this.startPolling();

    if (this.ongoingExecutions.length === 0) {
      //this.getAllExecutions();
    }

    if (!this.workflows.ongoingExecutionIsDone) { return false; }
    this.workflows.ongoingExecutionIsDone.subscribe(
       status => {
         if (status) {
           this.refreshExecutions();
         }
    });

    if (!this.workflows.workflowCancelled) { return false; }
    this.workflows.workflowCancelled.subscribe(
      status => {
         if (status) {
           this.refreshExecutions();
         }
    });

  }

  /** startPolling
  /* list of executions has to parts: running/inqueue ones and all other exections
  /* check for updates on running/inqueue xecutions
  /* if more or less running/inqueue executions than before: update overall list of executions
  */
  startPolling() {
    /*if (this.ongoingExecutionsCurrentTotal !== this.ongoingExecutions.length) {
      this.successMessage = '';
      this.nextPage = 0;
      this.allExecutions = []; 
      this.getAllExecutions();
    }
    this.ongoingExecutionsCurrentTotal = this.ongoingExecutions.length;
    this.nextPageOngoing = 0;
    this.ongoingExecutions = [];
    this.getOngoingExecutions();*/


    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoingExecutions();
    });

  }

  /** getOngoingExecutions
  /* get all ongoing executions, either in queue or running
  /* datasetname needs to be added to executions for use in table
  */
  getOngoingExecutions() {
    
    if (!this.authentication.validatedUser()) { return false; }

    let executions = this.ongoingExecutionDataOutput;
    if (!executions) { return false; }

    this.ongoingExecutionsOutput = this.datasets.addDatasetNameAndCurrentPlugin(executions);
  }

  /** getAllExecutions
  /* get all executions, ordered by most recent started
  /* datasetname needs to be added to executions for use in table
  */
  getAllExecutions() {   
    return false;
    let thisPage = this.nextPage;
    let currentPage = this.currentPage;

    if (this.nextPage === -1 || !this.authentication.validatedUser()) { return false }
    this.workflows.getAllExecutionsPerOrganisation(this.nextPage, false).subscribe(executions => {
      this.allExecutions = this.allExecutions.concat(this.datasets.addDatasetNameAndCurrentPlugin(executions['results']));
      this.nextPage = executions['nextPage'];

      if (currentPage > thisPage) {
        this.getAllExecutions();
      }

    },(err: HttpErrorResponse) => {
      clearTimeout(this.pollingTimeout);
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });  
  }

  /** loadNextPage
  /* used in history table to display next page
  */
  loadNextPage() {
    if (this.nextPage !== -1) {
      this.currentPage++;
      this.getAllExecutions();
    }
  }

  /** refreshExecutions
  /*  refresh list of executions
  */
  refreshExecutions() {
    this.nextPage = 0;
    this.allExecutions = [];
    this.ongoingExecutions = [];
    this.ongoingExecutionsCurrentTotal = 0;

    this.getAllExecutions();    
    clearTimeout(this.pollingTimeout);
    this.startPolling();     
  }
}
