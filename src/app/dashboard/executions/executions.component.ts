import {timer as observableTimer, Observable} from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

  @Input('runningExecutionDataOutput') ongoingExecutionDataOutput;
  @Input('executionDataOutput') executionDataOutput;

  allExecutions:Array<any> = [];
  ongoingExecutionsOutput: Array<any> = [];
  ongoingExecutionsCurrentTotal: number = 0;
  currentPage: number = 0;
  intervalTimer: number = environment.intervalStatus;
  errorMessage: string;
  successMessage: string;
  subscription;
  isLoading = true;

  @Output() nextPage: EventEmitter<any> = new EventEmitter();

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
  }

  /** startPolling
  /* list of executions has to parts: running/inqueue ones and all other exections
  /* check for updates on running/inqueue xecutions
  /* if more or less running/inqueue executions than before: update overall list of executions
  */
  startPolling() {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoingExecutions();
      this.getAllExecutions();
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
    if (!this.executionDataOutput) { return false; }
    this.allExecutions = this.datasets.addDatasetNameAndCurrentPlugin(this.executionDataOutput);
    this.isLoading = false;    
  }

  /** loadNextPage
  /* used in history table to display next page
  */
  loadNextPage() {
    this.isLoading = true;
    this.currentPage++;
    this.nextPage.emit(this.currentPage);
  }
}
