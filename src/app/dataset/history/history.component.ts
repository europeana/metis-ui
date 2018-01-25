import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, AuthenticationService } from '../../_services';
import { StringifyHttpError } from '../../_helpers';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute, 
    private workflows: WorkflowService,
    private authentication: AuthenticationService, 
    private router: Router) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;
  report;
  activeRow;
  allWorkflows;
  currentPlugin:number = 0;

  ngOnInit() { 

    this.returnAllWorkflows();
    
  }

  returnAllWorkflows() {

    this.allWorkflows = '';
    this.workflows.getAllWorkflows(this.datasetData.datasetId).subscribe(result => {
      if (this.inCollapsablePanel) {
        this.allWorkflows = result['results'].slice(0, 4);
      } else {
        this.allWorkflows = result['results'];
      }

      console.log(this.allWorkflows);

    },(err: HttpErrorResponse) => {
      if (err.status === 401 || err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }
    });

  }

  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

  triggerWorkflow(workflowName) {    

    this.errorMessage = '';
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId, workflowName).subscribe(result => {
      this.returnAllWorkflows();
      this.workflows.setActiveWorkflow(result);      
    }, (err: HttpErrorResponse) => {
      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }

      this.errorMessage = `Not able to load this dataset: ${StringifyHttpError(err)}`;
      
    });

  }

  openReport (taskid, topology) {
  
    this.report = '';

    this.workflows.getReport(taskid, topology).subscribe(result => {

      this.workflows.setCurrentReport(result);
      this.report = result;

    }, (err: HttpErrorResponse) => {
      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }

      this.errorMessage = `Not able to load this dataset: ${StringifyHttpError(err)}`;
      
    });

  }

  showStatusWorkflow (row) {
    if (this.inCollapsablePanel) {
      this.workflows.setSpecificWorkflow(row);
      this.activeRow = row;
    }
  }

}
