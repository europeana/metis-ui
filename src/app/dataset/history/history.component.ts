import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, ErrorService, TranslateService } from '../../_services';
import { StringifyHttpError, copyExecutionAndTaskId } from '../../_helpers';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(public workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;
  report;
  allExecutions: Array<any> = [];
  allExecutionsPanel: Array<any> = [];
  historyInPanel: Array<any> = [];
  currentPlugin: number = 0;
  nextPage: number = 0;
  workflowRunning: boolean = false;
  filterWorkflow: boolean = false;
  allWorkflows;
  totalPages: number = 0;
  contentCopied: boolean = false;

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
          this.triggerWorkflow();
          if (this.inCollapsablePanel) {
            this.allExecutions = [];
          }
        }
      );
    }

    if (!this.inCollapsablePanel) {
      if (typeof this.workflows.getCurrentPageNumberForComponent !== 'function') { return false }
      this.totalPages = this.workflows.getCurrentPageNumberForComponent('history');
      this.returnAllExecutions();
    } else {
      this.getLatestExecution();
    }
    
    this.workflows.changeWorkflow.subscribe(
      workflow => {
        if (workflow) {   
          const currentPlugin = this.workflows.getCurrentPlugin(workflow);
          if (workflow['metisPlugins'][currentPlugin].pluginStatus === 'RUNNING' || workflow['metisPlugins'][currentPlugin].pluginStatus === 'INQUEUE') {
            this.workflowRunning = true;
          }
        }
      }
    );

    this.workflows.updateHistoryPanel.subscribe(
      workflow => {
        if (workflow) {   
          this.updateExecutionHistoryPanel(workflow);
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
          } 
          this.returnAllExecutions();          
        }
      }
    );

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** updateExecutionHistoryPanel
  /*  update execution information in history panel specific
  /* @param {any} workflow - current running workflow
  */
  updateExecutionHistoryPanel(workflow) {

    let r = workflow;
    this.historyInPanel = [];

    for (let w = 0; w < r['metisPlugins'].length; w++) { 
      if(['FINISHED', 'FAILED', 'CANCELLED'].indexOf(r['metisPlugins'][w].pluginStatus) > -1) {
        this.historyInPanel.push(this.getReport(r['metisPlugins'][w]));      
      }            
    }

    if (this.inCollapsablePanel) {
      let history = this.historyInPanel;
      this.allExecutions = history.reverse();
    }
  }

  /** returnAllExecutions
  /*  return all executions, either max 1 to display in collapsable panel of list with pagination
  /*  option to filter on workflow in table
  */
  returnAllExecutions() {

    if (!this.datasetData) { return false; }

    let startPage = 0;
    const totalPageNr = this.totalPages;

    this.workflows.getAllExecutions(this.datasetData.datasetId, this.nextPage).subscribe(result => {

      if (result['results'].length === 0) { this.nextPage = 0; return false }

      let showTotal = result['results'].length;
      if (this.inCollapsablePanel && result['results'].length >= 1 ) {
        showTotal = 1;
      }

      for (let i = 0; i < showTotal; i++) {
        let r = result['results'][i];
        r['metisPlugins'].reverse();
        this.allExecutions.push(r);
        for (let w = 0; w < r['metisPlugins'].length; w++) {
          this.allExecutions.push(this.getReport(r['metisPlugins'][w]));
        }
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

    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;  
    });
  }

  /** getReport
  /*  check if the execution is finished/failed
  /*  add a report when available
  */
  getReport(w) {
    let ws = w;
    ws['hasReport'] = false;  
    if (w.pluginStatus === 'FINISHED' || w.pluginStatus === 'FAILED') {
      if (w.externalTaskId !== null && w.topologyName !== null && w.topologyName) {
        this.workflows.getReport(w.externalTaskId, w.topologyName).subscribe(report => {
          if (report['errors'].length > 0) {
            ws['hasReport'] = true;
          } 
        }, (err: HttpErrorResponse) => {
          this.errors.handleError(err);        
        });
      }
    }
    return ws;
  }

  /** getLatestExecution
  /*  get last execution, set status to running if it indeed does run or is inqueue
  /*  and update the history panel with the most recent details
  */
  getLatestExecution() {
    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(status => {
      if (!status) { return false; }
      const currentPlugin = this.workflows.getCurrentPlugin(status);
      if (!status['metisPlugins'][currentPlugin]) { return false; }
      if (status['metisPlugins'][currentPlugin].pluginStatus === 'RUNNING' || status['metisPlugins'][currentPlugin].pluginStatus === 'INQUEUE') {
        this.workflowRunning = true;
      }
      this.updateExecutionHistoryPanel(status);
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);        
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
  triggerWorkflow() {   
    this.errorMessage = undefined;
    if (!this.datasetData) { return false; }
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId).subscribe(result => {
      this.workflows.setActiveWorkflow(result); 
      this.workflowRunning = true;     
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err); 
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
      const error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

  /*** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation (type, id1, id2) {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
