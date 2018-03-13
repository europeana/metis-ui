import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, ErrorService, TranslateService } from '../../_services';
import { StringifyHttpError } from '../../_helpers';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute, 
    private workflows: WorkflowService,
    private router: Router,
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;
  report;
  allExecutions: Array<any> = [];
  currentPlugin: number = 0;
  nextPage: number = 0;
  workflowRunning: boolean = false;
  filterWorkflow: boolean = false;
  selectedFilterWorkflow: string = '';
  allWorkflows;
  totalPages: number = 0;

  /** ngOnInit
  /* init for this specific component
  /* if in collapsable panel, subscribe to selected workflow so trigger after change
  /* if nog in collapsable panel, check for current page number and get all executions for all pages
  /* act upon changes in workflow
  /* act when workflow is done
  /* get all workflows
  /* and set translation langugaes
  */
  ngOnInit() { 
  
   if (this.inCollapsablePanel) {
      this.workflows.selectedWorkflow.subscribe(
        selectedworkflow => {
          this.triggerWorkflow(selectedworkflow);
        }
      );
    }

    if (!this.inCollapsablePanel) {
      if (typeof this.workflows.getCurrentPageNumberForComponent !== 'function') { return false }
      this.totalPages = this.workflows.getCurrentPageNumberForComponent('history');
      this.returnAllExecutions();
    } else {
      this.returnAllExecutions();
    }
    
    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {          
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
          if (!this.inCollapsablePanel) {
            this.totalPages = this.workflows.getCurrentPageNumberForComponent('history');
            this.returnAllExecutions();
          } else {
            this.returnAllExecutions();
          }
        }
      }
    );

    if (typeof this.workflows.getWorkflows !== 'function') { return false }
    this.allWorkflows = this.workflows.getWorkflows();

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** returnAllExecutions
  /*  return all executions, either max 4 to display in collapsable panel of list with pagination
  /*  option to filter on workflow in table
  */
  returnAllExecutions() {

    if (!this.datasetData) { return false; }

    let filterWorkflow = this.selectedFilterWorkflow;
    if (this.inCollapsablePanel) {
      filterWorkflow = '';
    }

    let startPage = 0;
    let totalPageNr = this.totalPages;

    this.workflows.getAllExecutions(this.datasetData.datasetId, this.nextPage, filterWorkflow).subscribe(result => {

      if (result['results'].length === 0) { this.nextPage = 0; return false }

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
        startPage = this.nextPage;
        this.workflows.setCurrentPageNumberForComponent(this.nextPage, 'history');
        this.nextPage = result['nextPage'];

        if (totalPageNr > 0) {
          if (startPage < totalPageNr) {
            this.loadNextPage();
          }
        } 
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

  /** scroll
  /*  scroll to specific point in page after click
  /* @param {any} el - scroll to defined element
  */
  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

  /** loadNextPage
  /*  used in processing history table to display next page
  */
  loadNextPage() {
    if (this.nextPage !== -1) {
      this.returnAllExecutions();
    }
  }

  /** triggerWorkflow
  /*  trigger a workflow, based on selection in workflow dropdown or restart button
  /* @param {string} workflowName - name of workflow to trigger
  */
  triggerWorkflow(workflowName) {   
    this.errorMessage = undefined;
    if (!this.datasetData) { return false; }
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId, workflowName).subscribe(result => {
      this.workflows.setActiveWorkflow(result); 
      this.workflowRunning = true;     
    }, (err: HttpErrorResponse) => {
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

  /** openReport
  /*  click on link to open report, if available
  /* @param {number} taskid - id of task
  /* @param {string} topology - name of topology
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

  /** toggleFilterByWorkflow
  /*  toggle workflow dropdown
  */
  toggleFilterByWorkflow () {
    if (this.filterWorkflow === false) {
      this.filterWorkflow = true;
    } else {
      this.filterWorkflow = false;
    }
  }

  /** selectWorkflow
  /*  select an option from the workflow filter
  /* @param {string} w - name of workflow
  */
  selectWorkflow (w) {
    this.selectedFilterWorkflow = w;
    this.totalPages = this.workflows.getCurrentPageNumberForComponent('history');
    this.nextPage = 0;
    this.allExecutions = [];
    this.returnAllExecutions();
    this.filterWorkflow = false;
  }

  /** onClickedOutside
  /*  click outside the workflow filter to close
  */
  onClickedOutside() {
    this.filterWorkflow = false;
  }

}
