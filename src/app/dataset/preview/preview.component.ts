import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService, TranslateService } from '../../_services';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { previewSamples } from '../../_mocked';

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
    private translate: TranslateService) { }

  @Input('datasetData') datasetData;
  editorPreviewCode;
  editorPreviewTitle;
  editorConfig;
  allWorkflows;
  allSamples;
  filterWorkflow: boolean = false;
  selectedWorkflow: string;
  selectedWorkflowSamples: Array<any> = [];
  filterWorkflowSample: boolean = false;
  displaySearch: boolean = false;
  minRandom: number = 1;
  maxRandom: number = 3;
  nosample: string = 'No sample';
  displayFilterWorkflow;
  expandedSample;
    
  ngOnInit() {

    if (typeof this.workflows.getWorkflows !== 'function') { return false }
    this.allWorkflows = this.workflows.getWorkflows();

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
      this.getXMLSamples();
    }

  }

  getXMLSamples() {
    this.allSamples = this.workflows.getWorkflowSamples();
    if (this.allSamples.length === 1) {
      this.expandedSample = 0;
    }
  }

  getXMLSample(mode?, workflow?, keyword?, index?) {
    this.editorPreviewCode = undefined;
    this.editorPreviewTitle = undefined;

    if (typeof index !== 'number') {
      this.selectedWorkflow = undefined;
      this.selectedWorkflowSamples = [];
    }

    let previewSample;

    if (!mode) { 
      previewSample = this.showRandomPreview();
      this.displaySearch = false;
    } else if (mode === 'workflow' && workflow !== '') {
      previewSample = this.filterPreviewWorkflow(workflow);
      this.displaySearch = false;
      if (typeof index === 'number') {
        this.selectedWorkflowSamples[index] = workflow;
      } else {
        this.selectedWorkflow = workflow;
      }
    } else if (mode === 'search' && keyword != '') {
      previewSample = this.searchPreview(keyword); 
    }
 
    this.editorPreviewCode = beautify.xml(previewSample.sample);
    this.editorPreviewTitle = previewSample.name;
    this.onClickedOutside();
  }

  filterPreviewWorkflow(w) {
    if (w === 'only_harvest') {
      return {'name': 'sample1', 'sample': previewSamples['sample1']};
    } else if (w === 'only_validation_external') {
      return {'name': 'sample2', 'sample': previewSamples['sample2']};
    } else if (w === 'harvest_and_validation_external') {
      return {'name': 'sample3', 'sample': previewSamples['sample3']};
    } else {
      return {'name': this.nosample, 'sample': this.nosample};
    }
  }

  showRandomPreview () {
    let random = Math.floor(Math.random() * (this.maxRandom - this.minRandom + 1)) + this.minRandom;
    return {'name': 'sample'+random, 'sample': previewSamples['sample'+random]};    
  }

  displaySearchBox() {
    this.displaySearch = true;
    this.onClickedOutside();
  }

  searchPreview(keyword) {
    if (keyword === '123') {
      return {'name': 'sample1', 'sample': previewSamples['sample1']};
    } else if (keyword === '456') {
      return {'name': 'sample2', 'sample': previewSamples['sample2']};
    } else if (keyword === '789') {
      return {'name': 'sample3', 'sample': previewSamples['sample3']};
    } else {
      return {'name': this.nosample, 'sample': this.nosample};
    }
  }

  expandSample(i) {
    if (this.expandedSample === i) {
      this.expandedSample = undefined;
    } else {
      this.expandedSample = i;
    }
  }

  toggleFilterPreview() {
    this.displayFilterWorkflow = undefined;
    if (this.filterWorkflow === false) {
      this.filterWorkflow = true;
    } else {
      this.filterWorkflow = false;
    }
  }

  toggleFilterPreviewSample(i) {
    if (this.filterWorkflowSample === false) {
      this.displayFilterWorkflow = i;
      this.filterWorkflowSample = true;
    } else {
      this.filterWorkflowSample = false;
    }
  }

  onClickedOutside(e?) {
    if (e !== undefined) {
      if (e.path[0].className.indexOf('dropdown-specific') >= 0 || e.path[1].className.indexOf('dropdown-specific') >= 0) {
        this.filterWorkflowSample = true;
      } else {
        this.filterWorkflowSample = false;
      }
    }
    this.filterWorkflow = false;    
  }

}
