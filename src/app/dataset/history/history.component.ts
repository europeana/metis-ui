import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, AuthenticationService, ErrorService } from '../../_services';
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
    private router: Router,
    private errors: ErrorService) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;
  report;
  allWorkflows: Array<any> = [];
  currentPlugin: number = 0;
  nextPage: number = 0;
  workflowRunning: Boolean = false;

  ngOnInit() { 
    this.returnAllWorkflows();

    this.workflows.changeWorkflow.map(
      workflow => {
        if (!workflow) {
          this.allWorkflows = [];
          this.nextPage = 0;
          this.returnAllWorkflows();
        }
      }
    ).toPromise();

    this.workflows.selectedWorkflow.map(
      selectedworkflow => {
        this.triggerWorkflow(selectedworkflow);
      }
    ).toPromise();

    this.workflows.workflowIsDone.map(
      workflowstatus => {
        if (workflowstatus) {
          this.workflowRunning = false;
          this.allWorkflows = [];
          this.nextPage = 0;
          this.returnAllWorkflows();
        }
      }
    ).toPromise();

  }

  returnAllWorkflows() {
    
    if (!this.datasetData) { return false; }

    this.workflows.getAllWorkflows(this.datasetData.datasetId, this.nextPage).subscribe(result => {
      
      let showTotal = result['results'].length;
      if (this.inCollapsablePanel && result['results'].length >= 4 ) {
        showTotal = 4;
      }

      for (let i = 0; i < showTotal; i++) {
        result['results'][i]['hasReport'] = false;
        if (result['results'][i].metisPlugins[0].externalTaskId !== null && result['results'][i].metisPlugins[0].topologyName !== null) {
          this.workflows.getReport(result['results'][i].metisPlugins[0].externalTaskId, result['results'][i].metisPlugins[0].topologyName).subscribe(r => {
            if (r['errors'].length > 0) {
              result['results'][i]['hasReport'] = true;
            } 
          });
        }
        this.allWorkflows.push(result['results'][i]);
      }

      if (!this.inCollapsablePanel) {
        this.nextPage = result['nextPage'];
      }

      if (result['results'][0]['workflowStatus'] === 'RUNNING' ||  result['results'][0]['workflowStatus'] === 'INQUEUE') {
        this.workflowRunning = true;
      }

    },(err: HttpErrorResponse) => {
      this.errors.handleError(err);   
    });
  }

  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

  loadNextPage() {
    if (this.nextPage > 0) {
      this.returnAllWorkflows();
    }
  }

  triggerWorkflow(workflowName) {   
    this.errorMessage = '';
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId, workflowName).subscribe(result => {
      this.workflows.setActiveWorkflow(result); 
      this.workflowRunning = true;     
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);   
    });

  }

  openReport (taskid, topology) {  
    this.report = '';
    this.workflows.getReport(taskid, topology).subscribe(result => {
      this.workflows.setCurrentReport(result);
      this.report = result;
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);     
    });
  }

}
