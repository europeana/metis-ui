import { Component, OnInit } from '@angular/core';
import { WorkflowService, TranslateService, ErrorService } from '../../_services';

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
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss']
})
export class MappingComponent implements OnInit {

  constructor(private workflows: WorkflowService, 
    private errors: ErrorService,
    private translate: TranslateService) { }

  defaultEditorConfig;
  editorConfig;
  editorConfigEdit;
  statistics;
  fullXSLT;
  xslt: Array<any> = [];
  errorMessage: string;
  fullView: boolean = true; 
  splitter: string = '<!-- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX -->';
  expandedSample: number;
  expandedStatistics: boolean;

  ngOnInit() {

  	 this.defaultEditorConfig = { 
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      foldGutter: true,
      indentWithTabs: true,
      readOnly: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }

    this.loadStatistics();
    this.loadEditor();
    this.toggleFullViewMode(true);

  }

  /** loadStatistics
  /* load the data on statistics and display this in a card (=readonly editor)
  /* mocked data for now
  */
  loadStatistics() {
    this.editorConfig = Object.assign(this.defaultEditorConfig);
    Object.freeze(this.defaultEditorConfig);
    this.statistics = JSON.stringify(this.workflows.getStatistics(), null, '\t');
  }

  /** loadEditor
  /* load the xslt in an editor/card
  /* fullview (whole file in one card) or not (display in different cards, based on comments in file)
  */
  loadEditor() {
    this.editorConfigEdit = Object.assign({}, this.defaultEditorConfig);
    this.editorConfigEdit['readOnly'] = false;
    
    this.fullXSLT = this.workflows.getXSLT();
    this.displayXSLT();
  }

  /** displayXSLT
  /* display xslt, either as one file or in individual cards
  /* expand the sample when in full view, else start with all cards "closed" 
  */
  displayXSLT() {
    this.xslt = [];
    if (this.fullView) {
      this.xslt.push(this.fullXSLT);
      this.expandedSample = 0;       
    } else {
      this.xslt = this.splitXSLT();
      this.expandedSample = undefined;      
    }
  }

  /** splitXSLT
  /* split xslt on comments to show file in individual cards
  */
  splitXSLT() {
    return this.fullXSLT.split(this.splitter);
  }

  /** toggleFullViewMode
  /* show either xslt in one card (fullView) or in individual cards
  /* fullview (whole file in one card) or not (display in different cards, based on comments in file)
  /* @param {boolean} mode - fullview (true) or individual cards (false)
  */
  toggleFullViewMode(mode: boolean) {
    this.fullView = mode;
    this.displayXSLT();
  }

  /** toggleStatistics
  /* expand statistics panel
  */
  toggleStatistics() {
    this.expandedStatistics = this.expandedStatistics === true ? false : true;
  }

  /** expandSample
  /* expand the editor, so you can view more lines of code
  /* only one sample can be expanded
  /* @param {number} index - index of sample to expand
  */
  expandSample(index: number) {
    this.expandedSample = this.expandedSample === index ? undefined : index;
  }

}
