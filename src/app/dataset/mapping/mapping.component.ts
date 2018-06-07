import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService, DatasetsService, TranslateService, ErrorService } from '../../_services';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError } from '../../_helpers';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

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
    private datasets: DatasetsService,
    private translate: TranslateService, 
    private router: Router) { }

  @Input() datasetData: any;
  editorConfigEdit;
  statistics;
  statisticsMap = new Map();
  fullXSLT;
  xsltType: string = 'default';
  xslt: Array<any> = [];
  xsltToSave: Array<any> = [];
  xsltHeading: string;
  errorMessage: string;
  successMessage: string;
  fullView: boolean = true; 
  splitter: string = environment.xsltSplitter;
  expandedSample: number;
  expandedStatistics: boolean;
  msgXSLTSuccess: string;

  ngOnInit() {
  	 this.editorConfigEdit = { 
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      foldGutter: true,
      indentWithTabs: true,
      readOnly: false,
      viewportMargin: Infinity,
      lineWrapping: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.msgXSLTSuccess = this.translate.instant('xsltsuccessful');
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
    this.workflows.getAllFinishedExecutions(this.datasetData.datasetId, 0).subscribe(result => {      
      let taskId: string;
      if (result['results'].length > 0) {
        // find validation in the latest run, and if available, find taskid
        for (var i = 0; i < result['results'][0]['metisPlugins'].length; i++) {
          if (result['results'][0]['metisPlugins'][i]['pluginType'] === 'VALIDATION_EXTERNAL') {
            taskId = result['results'][0]['metisPlugins'][i]['externalTaskId'];
          }
        }
      }

      if (!taskId) { return false; }
      this.successMessage = 'Loading statistics';
      this.workflows.getStatistics('validation', taskId).subscribe(result => {
        this.statistics = result['nodeStatistics'];
        this.successMessage = undefined;
      }, (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err); 
        this.errorMessage = `${StringifyHttpError(error)}`;   
      });      
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err); 
    });   
  }

  /** loadEditor
  /* load the xslt in an editor/card
  /* fullview (whole file in one card) or not (display in different cards, based on comments in file)
  */
  loadEditor() {
    let type = this.datasets.getTempXSLT();
    if (!type) {
      type = 'default';
    }
    this.loadXSLT(type);
  }

  /** loadXSLT
  /* either default or custom
  /* display XSLT
  /* show message if no custom XSLT
  */
  loadXSLT(type) {
    this.xsltType = type;
    this.datasets.getXSLT(this.xsltType, this.datasetData.datasetId).subscribe(result => {
      this.fullXSLT = result;
      this.displayXSLT();
    }, (err: HttpErrorResponse) => {      
      this.errors.handleError(err); 
      if (this.xsltType === 'custom') {
        this.xslt[0] = undefined;
        this.xsltHeading = 'No custom XSLT yet';
      }
    });
  }

  /** displayXSLT
  /* display xslt, either as one file or in individual cards
  /* expand the sample when in full view, else start with all cards "closed" 
  /* empty xsltToSave to avoid misalignments
  */
  displayXSLT() {
    this.xslt = [];
    this.xsltToSave = [];
    this.xsltHeading = this.xsltType;
    
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

  /** tryOutXSLT
  /* transformation on the fly, so having a look before saving the xslt
  /* switch to preview tab to have a look of the outcome
  /* @param {string} type - either custom or default
  */
  tryOutXSLT(type) {
    this.datasets.setTempXSLT(type);
    if (type === 'default') { // no need to save, but move to preview directly
      this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]); 
    } else {
      this.saveXSLT(true);
    }
  }

  /** getFullXSLT
  /* get the full xslt
  */
  getFullXSLT() {
    let xsltValue = '';  

    if (this.fullView) {
      xsltValue = this.xsltToSave[0] ? this.xsltToSave[0] : this.xslt[0];
    } else {
      for (let i = 0; i < this.xslt.length; i++) {
        if (this.xsltToSave[i]) {
          xsltValue += this.xsltToSave[i];
        } else {
          xsltValue += (i === 0 ? '' : this.splitter) + this.xslt[i];
        }
      }        
    }
    return xsltValue;
  }

  /** saveXSLT
  /* save the xslt as the custom - that is dataset specific - one
  /* combine individual "cards" when not in full view
  /* switch to custom view after saving
  /* @param {boolean} tryout - "tryout" xslt in preview tab or just save it, optional
  */
  saveXSLT(tryout?) {
    let xsltValue = this.getFullXSLT();  
    let datasetValues = { 'dataset': this.datasetData, 'xslt': xsltValue };   
    this.datasets.updateDataset(datasetValues).subscribe(result => {
      this.loadXSLT('custom');
      this.successMessage = this.msgXSLTSuccess;
      if (tryout === true) {
        this.router.navigate(['/dataset/preview/' + this.datasetData.datasetId]); 
      }
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err); 
      this.errorMessage = `${StringifyHttpError(error)}`;   
    });
  }

  /** toggleFullViewMode
  /* show either xslt in one card (fullView) or in individual cards
  /* fullview (whole file in one card) or not (display in different cards, based on comments in file)
  /* @param {boolean} mode - fullview (true) or individual cards (false)
  */
  toggleFullViewMode(mode: boolean) {
    if (this.xsltToSave[0]) {
      this.saveXSLT();
    }
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

  /** scroll
  /*  scroll to specific point in page after click
  /* @param {any} el - scroll to defined element
  */
  scroll(el) {
    el.scrollIntoView({behavior:'smooth'});
  }

  /** closeMessages
  /*  close messagebox
  */  
  closeMessages() {
    this.errorMessage = undefined;
    this.successMessage = undefined;
  }

}
