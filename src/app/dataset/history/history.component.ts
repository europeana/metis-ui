import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { timer as observableTimer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

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
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  @Input('datasetData') datasetData;
  @Input('lastExecutionData') lastExecutionData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;
  report;
  allExecutions: Array<any> = [];
  allExecutionsPanel: Array<any> = [];
  historyInPanel: Array<any> = [];
  currentPlugin: number = 0;
  nextPage: number = 0;
  totalPages: number = 0;
  contentCopied: boolean = false;
  workflowHasFinished: boolean = false; 
  subscription;
  intervalTimer = environment.intervalStatusShort;
  checkStatusStarted: boolean = false;
  thisDatasetId;
  checkTrigger;

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

    this.route.params.subscribe(params => {
      this.thisDatasetId = params['id']; // if no id defined, let's create a new dataset
    });

    this.checkStatus();
    
    if (this.inCollapsablePanel) {
      this.checkTrigger = this.workflows.selectedWorkflow.subscribe(
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
    
    this.workflows.workflowIsDone.subscribe(
      workflowstatus => {
        if (workflowstatus && this.workflowHasFinished === false) {
          this.allExecutions = [];          
          this.nextPage = 0;
          this.workflowHasFinished = true;
          if (!this.inCollapsablePanel) {
            this.totalPages = this.workflows.getCurrentPageNumberForComponent('history');
          } 
          this.returnAllExecutions();    
          if (this.subscription) { this.subscription.unsubscribe(); }
          this.checkStatusStarted = false;
        } else if (!workflowstatus) {
          if (!this.checkStatusStarted) {
            this.checkStatus();
            this.checkStatusStarted = true;
            this.workflowHasFinished = false;
          }
        }
      }
    );

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  ngOnDestroy() {
    if (this.checkTrigger) { this.checkTrigger.unsubscribe(); }
  }

  /** checkStatus
  /*  start checking the status of the workflow
  */
  checkStatus () {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.updateExecutionHistoryPanel(this.lastExecutionData);
    }); 
  }

  /** updateExecutionHistoryPanel
  /*  update execution information in history panel specific
  /* @param {any} workflow - current running workflow
  */
  updateExecutionHistoryPanel(workflow) {

    if (!workflow) { return false; }
    if (this.historyInPanel.length === this.workflows.getCurrentPlugin(workflow) && this.historyInPanel.length && this.historyInPanel.length > 0 && this.workflows.getCurrentPlugin(workflow) > 0) { return false; }
    
    this.historyInPanel = [];
    let r = workflow;
    
    for (let w = 0; w < r['metisPlugins'].length; w++) { 
      if(['FINISHED', 'FAILED', 'CANCELLED'].indexOf(r['metisPlugins'][w].pluginStatus) > -1) {
        this.historyInPanel.push(this.getReport(r['metisPlugins'][w]));      
      }            
    }

    if (this.inCollapsablePanel) {
      let history = this.historyInPanel;
      history.reverse();
      this.allExecutions = history;
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

    if (w.pluginStatus === 'FINISHED' || w.pluginStatus === 'FAILED' || w.pluginStatus === 'CANCELLED') {
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
    let workflow = this.lastExecutionData;
    if (!workflow) { return false; }
    const currentPlugin = this.workflows.getCurrentPlugin(workflow);
    if (!workflow['metisPlugins'][currentPlugin]) { return false; }
    if (workflow['metisPlugins'][currentPlugin].pluginStatus === 'RUNNING' || workflow['metisPlugins'][currentPlugin].pluginStatus === 'INQUEUE') {
      this.workflowHasFinished = false;
    } else {
      this.workflowHasFinished = true;
    }
    this.updateExecutionHistoryPanel(workflow);
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

    console.log('triggerWorkflow', this.datasetData.datasetId);
    if (this.datasetData.datasetId !== this.thisDatasetId) { return false; }

    this.errorMessage = undefined;
    if (!this.datasetData) { return false; }
    this.workflows.triggerNewWorkflow(this.datasetData.datasetId).subscribe(result => {
      this.workflowHasFinished = false;
      this.workflows.setActiveWorkflow(result); 
      this.historyInPanel = [];
      this.workflows.workflowDone(false); 
      
      // delay the check status a bit
      setTimeout(() => {
        this.checkStatus();
      }, 5000);

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
