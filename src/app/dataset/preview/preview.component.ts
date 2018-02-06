import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService } from '../../_services';
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

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: [
    './preview.component.scss'
   ]
})

export class PreviewComponent implements OnInit {

  constructor(private workflows: WorkflowService, 
    private http: HttpClient) { }

  @Input('datasetData') datasetData;
  editorPreviewCode;
  editorConfig;
  allWorkflows;
  filterWorkflow: boolean = false;
  displaySearch: boolean = false;
  minRandom: number = 1;
  maxRandom: number = 3;

  ngOnInit() {

    if (this.datasetData) {
    	this.getXMLSample();
    }
  
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

  }

  getXMLSample(mode?, workflow?, keyword?) {
    this.editorPreviewCode = undefined;

    if (!mode) { // default = random
      this.editorPreviewCode = this.showRandomPreview();
    } else if (mode === 'workflow' && workflow !== '') {
      this.editorPreviewCode = this.filterPreviewWorkflow(workflow);
    } else if (mode === 'search' && keyword != '') {
      this.editorPreviewCode = this.searchPreview(keyword); 
    }

    this.onClickedOutside();

  }

  filterPreviewWorkflow(w) {
    if (w === 'only_harvest') {
      return previewSamples['sample1'];
    } else if (w === 'only_validation_external') {
      return previewSamples['sample2'];
    } else if (w === 'harvest_and_validation_external') {
      return previewSamples['sample3'];
    } else {
      return 'No sample available';
    }
  }

  showRandomPreview () {
    let random = Math.floor(Math.random() * (this.maxRandom - this.minRandom + 1)) + this.minRandom;
    return previewSamples['sample'+random];    
  }

  displaySearchBox() {
    this.displaySearch = true;
    this.onClickedOutside();
  }

  searchPreview(keyword) {
    if (keyword === '123') {
      return previewSamples['sample1'];
    } else if (keyword === '456') {
      return previewSamples['sample2'];
    } else if (keyword === '789') {
      return previewSamples['sample3'];
    } else {
      return 'No sample available';
    }
  }

  toggleFilterPreview() {
    if (this.filterWorkflow === false) {
      this.filterWorkflow = true;
    } else {
      this.filterWorkflow = false;
    }
  }

  onClickedOutside(e?) {
    this.filterWorkflow = false;
  }

}
