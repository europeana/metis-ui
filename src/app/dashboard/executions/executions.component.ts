import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Observable } from 'rxjs/Rx';

import { WorkflowService, ErrorService, TranslateService, DatasetsService } from '../../_services';

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
  currentPlugin: number = 0;
  currentPage: number = 0;
  nextPage: number = 0;
  nextPageOngoing: number = 0;
  gotoNextPage: number = 0;
  subscription;
  intervalTimer: number = 5000;
  totalPagesShowing: number = 0;
  errorMessage: string;

  ngOnInit() {
  	if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }  
    this.startPolling();
    this.getAllExecutions();
  }

  /* startPolling
    check for updates on executions
  */
  startPolling() {
    if (this.ongoingExecutionsCurrentTotal !== this.ongoingExecutions.length) {
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
      setTimeout(()=> {   
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

    this.workflows.getAllExecutionsPerOrganisation(this.nextPage).subscribe(executions => {
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
  */
  cancelWorkflow(id) {
    if (!id) { return false; }
    this.workflows.cancelThisWorkflow(id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

}
