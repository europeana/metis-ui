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
  filterDate: boolean = false;
  filterPlugin: boolean = false;
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
  tempXSLT;

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
      this.addDateFilter();
    }

    this.prefill = this.datasets.getPreviewFilters();
    this.prefillFilters();

    this.tempXSLT = this.datasets.getTempXSLT();
    if (this.tempXSLT) {
      this.transformSamples();
    }

  }  

  /** addDateFilter
  /* populate a filter with dates based on selected workflow
  /* sorted by date
  /* save selection, when switching tab
  /* @param {string} workflow - selected workflow
  */
  addDateFilter() {
    this.workflows.getAllFinishedExecutions(this.datasetData.datasetId, this.nextPageDate).subscribe(result => {
      for (let i = 0; i < result['results'].length; i++) {  
        this.allWorkflowDates.push(result['results'][i]);
      }
      this.nextPageDate = result['nextPage'];
      if (this.nextPageDate >= 0) {
        this.addDateFilter();
      }
    });     
  }

  /** addDateFilter
  /* populate a filter with plugins based on selected execution/date
  /* send complete execution object to function and not only date,
  /* to prevent a second (duplicate) call 
  /* save selection, when switching tab
  /* @param {object} execution - selected execution
  */
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

  /** getXMLSamples
  /* get and show samples based on plugin
  /* show loader while fetching the samples
  /* @param {string} plugin - selected plugin
  */
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

  /** transformSamples
  /* transform samples on the fly
  /* based on temp saved XSLT
  */
  transformSamples() {
    console.log('transformSamples');
    this.datasets.getTransform(this.datasetData.datasetId).subscribe(result => {
      console.log(result);
    }, (err: HttpErrorResponse) => {
      let error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

  /** saveTempFilterSelection
  /* save selected options from filters
  /* so they can be prefilled after switching tabs
  /* @param {filter} array - name of filter
  /* @param {toSave} any - string or object to save temporarily
  */
  saveTempFilterSelection(filter, toSave) {
    this.tempFilterSelection[filter] = toSave;
    this.datasets.setPreviewFilters(this.tempFilterSelection);
  }

  /** prefillFilters
  /* prefill filters, when temporarily saved options are available
  */
  prefillFilters() {
    if (this.prefill) {      
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

  /** expandSample
  /* expand the editor, so you can view more lines of code
  /* only one sample can be expanded
  /* @param {number} index - index of sample to expand
  */
  expandSample(index: number) {
    this.expandedSample = this.expandedSample === index ? undefined : index;
  }

  /** toggleFilterDate
  /* show or hide date filter
  */
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

  /** toggleFilterPlugin
  /* show or hide plugin filter
  */
  toggleFilterPlugin() {
    this.onClickedOutside();
    if (this.filterPlugin === false) {
      this.filterPlugin = true;
    } else {
      this.filterPlugin = false;
    }
  }

  /** onClickedOutside
  /* close all open filters when click outside the filters
  */
  onClickedOutside(e?) {
    this.filterDate = false;   
    this.filterPlugin = false;   
  }
}
