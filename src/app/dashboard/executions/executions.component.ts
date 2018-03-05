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
  currentPlugin: number = 0;
  nextPage: number = 0;
  gotoNextPage: number = 0;
  subscription;
  intervalTimer: number = 2000;
  totalPagesShowing: number = 0;

  ngOnInit() {
  	if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }  

    this.startPolling();
  }

  /* startPolling
    check for updates on executions
  */
  startPolling() {
    //if (this.subscription) { this.subscription.unsubscribe(); }
    //let timer = Observable.timer(0, this.intervalTimer);
    //this.subscription = timer.subscribe(t => {
      this.getAllExecutions();
    //});
  }

  /** getAllExecutions
  /* get all executions, ordered by most recent started
  /* datasetname needs to be added to executions for use in table
  */
  getAllExecutions() {    
    this.workflows.getAllExecutionsPerOrganisation(this.nextPage).subscribe(executions => {
      if (this.allExecutions.length === 0) {
        this.allExecutions = this.datasets.addDatasetNameToExecution(executions['results']);
      } else {
        this.allExecutions = this.allExecutions.concat(this.datasets.addDatasetNameToExecution(executions['results']));
      }
      this.nextPage = executions['nextPage'];
    });    
  }

  /** loadNextPage
  /* used in history table to display next page
  */
  loadNextPage() {
    if (this.nextPage !== -1) {
      this.getAllExecutions();
    }
  }

}
