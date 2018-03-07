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
  xslt;
  errorMessage: string;
  fullView: boolean = true; 

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

    //this.loadStatistics();
    this.loadEditor();

  }

  /** loadStatistics
  /* load the data on statistics and display this in a card (=readonly editor)
  /* mocked data for now
  */
  loadStatistics() {
    this.editorConfig = Object.assign(this.defaultEditorConfig);
    Object.freeze(this.defaultEditorConfig);
    this.statistics = this.workflows.getStatistics();
  }

  /** loadEditor
  /* load the xslt in an editor/card
  /* fullview (whole file in one card) or not (display in different cards, based on comments in file)
  */
  loadEditor() {
    this.editorConfigEdit = Object.assign({}, this.defaultEditorConfig);
    this.editorConfigEdit['readOnly'] = false;
    this.xslt = this.workflows.getXSLT();
  }

  toggleFullViewMode(mode: boolean) {
    console.log('toggleFullViewMode');
  }

}
