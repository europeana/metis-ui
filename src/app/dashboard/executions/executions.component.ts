import { timer as observableTimer, Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, ErrorService, TranslateService, DatasetsService, AuthenticationService } from '../../_services';
import { environment } from '../../../environments/environment';
import { WorkflowExecution } from '../../_models/workflow-execution';

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

  @Input('runningExecutionDataOutput') ongoingExecutionDataOutput: WorkflowExecution[];
  @Input('executionDataOutput') executionDataOutput: WorkflowExecution[];

  allExecutions: Array<WorkflowExecution> = [];
  ongoingExecutionsOutput: Array<WorkflowExecution> = [];
  ongoingExecutionsCurrentTotal = 0;
  currentPage = 0;
  perPage = 5;
  intervalTimer = environment.intervalStatus;
  errorMessage: string;
  successMessage: string;
  subscription: Subscription;
  isLoading = true;
  currentNumberOfRecords = 0;

  @Output() nextPage: EventEmitter<number> = new EventEmitter();

  /** ngOnInit
  /* init this component:
  /* set translation language,
  /* get all workflows for use in filter
  /* start polling, checking for updates
  */
  ngOnInit(): void {
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
  startPolling(): void {
    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoingExecutions();
      this.getAllExecutions();

      if (this.currentNumberOfRecords > (this.currentPage * this.perPage)) {
        this.isLoading = false;
      }
    });
  }

  /** getOngoingExecutions
  /* get all ongoing executions, either in queue or running
  /* datasetname needs to be added to executions for use in table
  */
  getOngoingExecutions(): void {
    if (!this.authentication.validatedUser()) { return; }
    const executions = this.ongoingExecutionDataOutput;
    if (!executions) { return; }
    this.ongoingExecutionsOutput = this.datasets.addDatasetNameAndCurrentPlugin(executions);
  }

  /** getAllExecutions
  /* get all executions, ordered by most recent started
  /* datasetname needs to be added to executions for use in table
  */
  getAllExecutions(): void {
    if (!this.executionDataOutput) { return; }
    this.allExecutions = this.datasets.addDatasetNameAndCurrentPlugin(this.executionDataOutput);
    this.currentNumberOfRecords = this.allExecutions.length;
  }

  /** loadNextPage
  /* used in history table to display next page
  */
  loadNextPage(): void {
    this.isLoading = true;
    this.currentPage++;
    this.nextPage.emit(this.currentPage);
  }
}
