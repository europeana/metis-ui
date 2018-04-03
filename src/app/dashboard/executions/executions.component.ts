import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Observable } from 'rxjs/Rx';

import { WorkflowService, ErrorService, TranslateService, DatasetsService } from '../../_services';
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
    private datasets: DatasetsService) { }

  allExecutions:Array<any> = [];
  ongoingExecutions: Array<any> = [];
  ongoingExecutionsOutput: Array<any> = [];
  ongoingExecutionsCurrentTotal: number = 0;
  ongoingExecutionDone: boolean = false;
  currentPlugin: number = 0;
  currentPage: number = 0;
  nextPage: number = 0;
  nextPageOngoing: number = 0;
  gotoNextPage: number = 0;
  pollingTimeout;
  intervalTimer: number = environment.intervalStatus;
  totalPagesShowing: number = 0;
  errorMessage: string;
  successMessage: string;
  filterWorkflow: boolean = false;
  allWorkflows: any;
  selectedFilterWorkflow;

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

    if (typeof this.workflows.getWorkflows !== 'function') { return false }
    this.allWorkflows = this.workflows.getWorkflows();

    this.startPolling();

    if (this.ongoingExecutions.length === 0) {
      this.getAllExecutions();
    }

    if (!this.workflows.ongoingExecutionIsDone) { return false; }
    this.workflows.ongoingExecutionIsDone.subscribe(
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
    if (this.ongoingExecutionsCurrentTotal !== this.ongoingExecutions.length) {
      this.successMessage = '';
      this.nextPage = 0;
      this.allExecutions = []; 
      this.getAllExecutions();
    }
    this.ongoingExecutionsCurrentTotal = this.ongoingExecutions.length;
    this.nextPageOngoing = 0;
    this.ongoingExecutions = [];
    this.getOngoingExecutions();
  }

  /** getOngoingExecutions
  /* get all ongoing executions, either in queue or running
  /* datasetname needs to be added to executions for use in table
  */
  getOngoingExecutions() {
    this.workflows.getAllExecutionsPerOrganisation(this.nextPageOngoing, true).subscribe(executions => {
      this.ongoingExecutions = this.ongoingExecutions.concat(this.datasets.addDatasetNameToExecution(executions['results']));
      if (executions['nextPage'] > 0) {
        this.nextPageOngoing = executions['nextPage'];
        this.getOngoingExecutions();
      } else {
        this.ongoingExecutionsOutput = this.ongoingExecutions;
      }   
    });
    
    if (this.nextPageOngoing <= 0) {
      this.pollingTimeout = setTimeout(()=> {   
        this.startPolling();
      }, this.intervalTimer);
    }
  }

  /** getAllExecutions
  /* get all executions, ordered by most recent started
  /* datasetname needs to be added to executions for use in table
  */
  getAllExecutions() {   
    let thisPage = this.nextPage;
    let currentPage = this.currentPage;

    if (this.nextPage === -1) { return false }

    this.workflows.getAllExecutionsPerOrganisation(this.nextPage, false).subscribe(executions => {
      this.allExecutions = this.allExecutions.concat(this.datasets.addDatasetNameToExecution(executions['results']));
      this.nextPage = executions['nextPage'];

      if (currentPage > thisPage) {
        this.getAllExecutions();
      }
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

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id) {
    if (!id) { return false; }
    this.workflows.cancelThisWorkflow(id).subscribe(result => {
      if (typeof this.translate.instant === 'function') { 
        this.successMessage = this.translate.instant('cancelling') + ': ' + id;
      } else {
        this.successMessage = 'Cancelling: ' + id;
      }
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** toggleFilterByWorkflow
  /*  show/hide workflow filter
  */
  toggleFilterByWorkflow() {
    this.filterWorkflow = this.filterWorkflow === false ? true : false;
  }

  /** toggleFilterByWorkflow
  /*  show/hide workflow filter
  */
  onClickedOutside() {
    this.filterWorkflow = false;
  }

  /** selectWorkflow
  /*  select a workflow from the dropdownlist
  /* @param {string} workflow - selected workflow
  */
  selectWorkflow(workflow) {
    this.selectedFilterWorkflow = workflow;
    this.filterWorkflow = false;
    this.refreshExecutions();
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
