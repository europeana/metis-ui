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
  allExecutions: Array<any> = [];
  currentPlugin: number = 0;
  nextPage: number = 0;
  workflowRunning: Boolean = false;

  ngOnInit() { 
    
    // only init once
    if (this.inCollapsablePanel) {
      this.workflows.selectedWorkflow.subscribe(
        selectedworkflow => {
          this.triggerWorkflow(selectedworkflow);
        }
      );
    }

    this.returnAllExecutions();

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {
          this.allExecutions = [];
          this.nextPage = 0;
          this.returnAllExecutions();
          if (workflow['metisPlugins'][this.currentPlugin].pluginStatus === 'RUNNING' || workflow['metisPlugins'][this.currentPlugin].pluginStatus === 'INQUEUE') {
            this.workflowRunning = true;
          }
        }
      }
    );

    this.workflows.workflowIsDone.subscribe(
      workflowstatus => {
        if (workflowstatus) {
          this.workflowRunning = false;
          this.allExecutions = [];
          this.nextPage = 0;
          this.returnAllExecutions();
        }
      }
    );

  }

  /* returnAllExecutions
    return all executions, either max 4 to display in collapsable panel of list with pagination
  */
  returnAllExecutions() {
    
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
         if (r['metisPlugins'][this.currentPlugin].pluginStatus === 'FINISHED' || r['metisPlugins'][this.currentPlugin].pluginStatus === 'FAILED') {
          if (r['metisPlugins'][this.currentPlugin].externalTaskId !== null && r['metisPlugins'][this.currentPlugin].topologyName !== null && r['metisPlugins'][this.currentPlugin].topologyName) {
            this.workflows.getReport(r['metisPlugins'][this.currentPlugin].externalTaskId, r['metisPlugins'][this.currentPlugin].topologyName).subscribe(report => {
              if (report['errors'].length > 0) {
                r['hasReport'] = true;
              } 
            });
          }
        }
        this.allExecutions.push(r);
      }

      if (!this.inCollapsablePanel) {
        this.nextPage = result['nextPage'];
      }

      this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(status => {
        if (!status) { return false; }
        if (status['metisPlugins'][this.currentPlugin].pluginStatus === 'RUNNING' || status['metisPlugins'][this.currentPlugin].pluginStatus === 'INQUEUE') {
          this.workflowRunning = true;
        }
      });

    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;  
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
      this.returnAllExecutions();
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
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
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
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

}
