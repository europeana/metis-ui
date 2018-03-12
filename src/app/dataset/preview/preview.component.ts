import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService, TranslateService, ErrorService, DatasetsService } from '../../_services';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';

import 'codemirror/mode/xml/xml';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';

import * as beautify from 'vkbeautify';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: [
    './preview.component.scss'
   ]
})

export class PreviewComponent implements OnInit {

  constructor(private workflows: WorkflowService, 
    private http: HttpClient,
    private translate: TranslateService,
    private errors: ErrorService,
    private datasets: DatasetsService) { }

  @Input('datasetData') datasetData;
  editorConfig;
  allWorkflows: Array<any> = [];
  allWorkflowDates: Array<any> = [];
  allPlugins: Array<any> = [];
  allSamples: Array<any> = [];
  filterWorkflow: boolean = false;
  filterDate: boolean = false;
  filterPlugin: boolean = false;
  selectedWorkflow: string;
  selectedDate: string;
  selectedPlugin: string;
  displayFilterWorkflow;
  displayFilterDate;
  displayFilterPlugin;
  expandedSample;
  nosample: string;
  errorMessage: string;
  nextPage: number = 0;
  nextPageDate: number = 0;
  datasetHistory;
  execution: number;
  tempFilterSelection: Array<any> = [];
  prefill;
  loadingSamples: boolean = false;

  /** ngOnInit
  /*  init this component
  /* set values for codemirror editor
  /* set translation language
  /* set translation for nosmaple key
  /* add a workflow filter if dataset is know
  /* get prefilled values and prefill filters if available
  */  
  ngOnInit() {
  	this.editorConfig = { 
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      readOnly: true,
      foldGutter: true,
      indentWithTabs: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }

    if (typeof this.translate.instant === 'function') { 
      this.nosample = this.translate.instant('nosample');
    }
    
    if (this.datasetData) {
      this.addWorkflowFilter();
    }

    this.prefill = this.datasets.getPreviewFilters();
    this.prefillFilters();

  }

  addWorkflowFilter() {
    this.workflows.getAllFinishedExecutions(this.datasetData.datasetId, this.nextPage).subscribe(result => {
      for (let i = 0; i < result['results'].length; i++) {
        if (this.allWorkflows.indexOf(result['results'][i]['workflowName']) === -1) {
          this.allWorkflows.push(result['results'][i]['workflowName']);
        }
      }
      this.allWorkflows.sort();
      this.nextPage = result['nextPage'];
      if (this.nextPage >= 0) {
        this.addWorkflowFilter();
      }
    });   
  }

  addDateFilter(workflow) {
    this.filterWorkflow = false;
    this.selectedWorkflow = workflow;
    this.saveTempFilterSelection('workflow', workflow);
    this.workflows.getAllFinishedExecutions(this.datasetData.datasetId, this.nextPageDate, workflow).subscribe(result => {
      for (let i = 0; i < result['results'].length; i++) {  
        this.allWorkflowDates.push(result['results'][i]);
      }
      this.nextPageDate = result['nextPage'];
      if (this.nextPageDate >= 0) {
        this.addDateFilter(workflow);
      }
    });     
  }

  addPluginFilter(execution) {
    this.filterDate = false;
    this.allPlugins = [];
    this.execution = execution;
    this.selectedDate = execution['startedDate'];    
    this.nextPageDate = 0;
    this.saveTempFilterSelection('date', execution);
    for (let i = 0; i < execution['metisPlugins'].length; i++) {  
      this.allPlugins.push(execution['metisPlugins'][i].pluginType);
    }
  }

  getXMLSamples(plugin) {
    this.loadingSamples = true;
    this.onClickedOutside();
    this.selectedPlugin = plugin; 
    this.saveTempFilterSelection('plugin', plugin);
    this.workflows.getWorkflowSamples(this.execution['id'], plugin).subscribe(result => {
      this.allSamples = result; 
      if (this.allSamples.length === 1) {
       this.expandedSample = 0;
      }
      this.loadingSamples = false;
    }, (err: HttpErrorResponse) => {
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

  saveTempFilterSelection(filter, toSave) {
    this.tempFilterSelection[filter] = toSave;
    this.datasets.setPreviewFilters(this.tempFilterSelection);
  }

  prefillFilters() {
    if (this.prefill) {
      if (this.prefill['workflow']) {
        this.selectedWorkflow = this.prefill['workflow'];
        this.addDateFilter(this.prefill['workflow']);
      }

      if (this.prefill['date']) {
        this.selectedDate = this.prefill['date'];
        this.addPluginFilter(this.prefill['date']);
      }

      if (this.prefill['plugin']) {
        this.selectedPlugin = this.prefill['plugin'];
        this.getXMLSamples(this.prefill['plugin']);
      }
    }
  }

  expandSample(i) {
    if (this.expandedSample === i) {
      this.expandedSample = undefined;
    } else {
      this.expandedSample = i;
    }
  }

  toggleFilterWorkflow() {
    this.onClickedOutside();
    this.nextPage = 0;
    this.nextPageDate = 0;
    this.allWorkflowDates = [];
    this.allPlugins = [];
    this.selectedDate = undefined;
    this.selectedPlugin = undefined;    
    if (this.filterWorkflow === false) {
      this.filterWorkflow = true;
    } else {
      this.filterWorkflow = false;
    }
  }

  toggleFilterDate() {
    this.onClickedOutside();
    this.nextPageDate = 0;
    this.allPlugins = [];
    this.selectedPlugin = undefined;
    if (this.filterDate === false) {
      this.filterDate = true;
    } else {
      this.filterDate = false;
    }
  }

  toggleFilterPlugin() {
    this.onClickedOutside();
    if (this.filterPlugin === false) {
      this.filterPlugin = true;
    } else {
      this.filterPlugin = false;
    }
  }

  onClickedOutside(e?) {
    this.filterWorkflow = false;  
    this.filterDate = false;   
    this.filterPlugin = false;   
  }
}
