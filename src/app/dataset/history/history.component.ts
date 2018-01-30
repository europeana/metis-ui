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

  /* returnAllWorkflows
    return all workflows, either max 4 to display in collapsable panel of list with pagination
  */
  returnAllWorkflows() {
    
    if (!this.datasetData) { return false; }

    this.workflows.getAllExecutions(this.datasetData.datasetId, this.nextPage).subscribe(result => {
      
      if (result['results'].length === 0) { return false }

      let showTotal = result['results'].length;
      if (this.inCollapsablePanel && result['results'].length >= 4 ) {
        showTotal = 4;
      }

      for (let i = 0; i < showTotal; i++) {
        let r = result['results'][i];
        r['hasReport'] = false;        
        if (r['workflowStatus'] === 'FINISHED') {
          if (r['metisPlugins'][this.currentPlugin].externalTaskId !== null && r['metisPlugins'][this.currentPlugin].topologyName !== null) {
            this.workflows.getReport(r['metisPlugins'][this.currentPlugin].externalTaskId, r['metisPlugins'][this.currentPlugin].topologyName).subscribe(report => {
              if (report['errors'].length > 0) {
                r['hasReport'] = true;
              } 
            });
          }
        }
        this.allWorkflows.push(r);
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

  /* scroll
    scroll to specific point in page after click
  */
  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

  /* loadNextPage
    used in processing history table to display next page
  */
  loadNextPage() {
    if (this.nextPage > 0) {
      this.returnAllWorkflows();
    }
  }

  /* triggerWorkflow
    trigger a workflow, based on selection in workflow dropdown or restart button
  */
  triggerWorkflow(workflowName) {   
    this.errorMessage = undefined;
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId, workflowName).subscribe(result => {
      this.workflows.setActiveWorkflow(result); 
      this.workflowRunning = true;     
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);   
    });

  }

  /* openReport
    click on link to open report, if available
  */
  openReport (taskid, topology) {  
    this.report = undefined;
    this.workflows.getReport(taskid, topology).subscribe(result => {
      this.workflows.setCurrentReport(result);
      this.report = result;
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);     
    });
  }

}
