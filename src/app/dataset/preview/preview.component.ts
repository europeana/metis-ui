import { Component, OnInit, Input } from '@angular/core';
import { WorkflowService, TranslateService, ErrorService, DatasetsService, PreviewFilters } from '../../_services';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Router } from '@angular/router';
import { EditorConfiguration } from 'codemirror';

import 'codemirror/mode/xml/xml';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';

import * as beautify from 'vkbeautify';
import { Dataset } from '../../_models/dataset';
import { XmlSample } from '../../_models/xml-sample';
import { WorkflowExecution } from '../../_models/workflow-execution';
import { Workflow } from '../../_models/workflow';

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
    private datasets: DatasetsService,
    private router: Router) { }

  @Input('datasetData') datasetData: Dataset;
  editorConfig: EditorConfiguration;
  allWorkflows: Array<Workflow> = [];
  allWorkflowDates: Array<WorkflowExecution> = [];
  allPlugins: Array<{ type: string, error: boolean }> = [];
  allSamples: Array<XmlSample> = [];
  allTransformedSamples: XmlSample[];
  filterDate = false;
  filterPlugin = false;
  selectedDate: string;
  selectedPlugin?: string;
  expandedSample?: number;
  nosample: string;
  errorMessage: string;
  nextPage = 0;
  nextPageDate = 0;
  execution: WorkflowExecution;
  tempFilterSelection: PreviewFilters = {};
  prefill: PreviewFilters;
  loadingSamples = false;
  tempXSLT: string | null;

  /** ngOnInit
  /*  init this component
  /* set values for codemirror editor
  /* set translation language
  /* set translation for nosmaple key
  /* add a workflow filter if dataset is know
  /* get prefilled values and prefill filters if available
  */
  ngOnInit(): void {
    this.editorConfig = {
      mode: 'application/xml',
      lineNumbers: true,
      indentUnit: 2,
      readOnly: true,
      foldGutter: true,
      indentWithTabs: true,
      viewportMargin: Infinity,
      lineWrapping: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    };

    this.translate.use('en');
    this.nosample = this.translate.instant('nosample');

    if (this.datasetData) {
      this.addDateFilter();
    }

    this.prefill = this.datasets.getPreviewFilters();
    this.prefillFilters();

    this.tempXSLT = this.datasets.getTempXSLT();
    if (this.tempXSLT) {
      this.transformSamples(this.tempXSLT);
    }
  }

  /** addDateFilter
  /* populate a filter with dates based on selected workflow
  /* sorted by date
  /* save selection, when switching tab
  /* @param {string} workflow - selected workflow
  */
  addDateFilter(): void {
    this.workflows.getAllExecutionsEveryStatus(this.datasetData.datasetId, this.nextPageDate).subscribe(result => {
      for (let i = 0; i < result['results'].length; i++) {
        this.allWorkflowDates.push(result['results'][i]);
      }
      this.nextPageDate = result['nextPage'];
      if (this.nextPageDate >= 0) {
        this.addDateFilter();
      }
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }

  /** addDateFilter
  /* populate a filter with plugins based on selected execution/date
  /* send complete execution object to function and not only date,
  /* to prevent a second (duplicate) call
  /* save selection, when switching tab
  /* @param {object} execution - selected execution
  */
  addPluginFilter(execution: WorkflowExecution): void {
    this.filterDate = false;
    this.allPlugins = [];
    this.execution = execution;
    this.selectedDate = execution.startedDate;
    this.nextPageDate = 0;
    this.saveTempFilterSelection('date', execution);
    for (let i = 0; i < execution['metisPlugins'].length; i++) {
      if (execution['metisPlugins'][i]['pluginStatus'] === 'FINISHED') {
        this.allPlugins.push({'type': execution['metisPlugins'][i].pluginType, 'error': false});
      } else {
        if (execution['metisPlugins'][i]['executionProgress']['processedRecords'] > execution['metisPlugins'][i]['executionProgress']['errors']) {
          this.allPlugins.push({'type': execution['metisPlugins'][i].pluginType, 'error': false});
        } else {
          this.allPlugins.push({'type': execution['metisPlugins'][i].pluginType, 'error': true});
        }
      }
    }
  }

  /** getXMLSamples
  /* get and show samples based on plugin
  /* show loader while fetching the samples
  /* @param {string} plugin - selected plugin
  */
  getXMLSamples(plugin: string): void {
    this.loadingSamples = true;
    this.onClickedOutside();
    this.selectedPlugin = plugin;
    this.saveTempFilterSelection('plugin', plugin);
    this.workflows.getWorkflowSamples(this.execution.id, plugin).subscribe(result => {
      this.allSamples = this.undoNewLines(result);
      if (this.allSamples.length === 1) {
       this.expandedSample = 0;
      }
      this.loadingSamples = false;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** transformSamples
  /* transform samples on the fly
  /* based on temp saved XSLT
  /* @param {string} type - either default or custom
  */
  transformSamples(type: string): void {
    this.workflows.getAllFinishedExecutions(this.datasetData.datasetId, 0).subscribe(result => {
      if (!result['results'][0]) { return; }
      this.workflows.getWorkflowSamples(result['results'][0]['id'], result['results'][0]['metisPlugins'][0]['pluginType']).subscribe(samples => {
        this.allSamples = this.undoNewLines(samples);
        this.datasets.getTransform(this.datasetData.datasetId, samples, type).subscribe(transformed => {
          this.allTransformedSamples = this.undoNewLines(transformed);
        }, (err: HttpErrorResponse) => {
          const error = this.errors.handleError(err);
          this.errorMessage = `${StringifyHttpError(error)}`;
        });
      }, (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      });
      return;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /** saveTempFilterSelection
  /* save selected options from filters
  /* so they can be prefilled after switching tabs
  /* @param {string} filter - name of filter
  /* @param {object | string} toSave - string or object to save temporarily
  */
  saveTempFilterSelection(filter: keyof PreviewFilters, toSave: WorkflowExecution | string): void {
    this.tempFilterSelection[filter] = toSave;
    this.datasets.setPreviewFilters(this.tempFilterSelection);
  }

  /** prefillFilters
  /* prefill filters, when temporarily saved options are available
  */
  prefillFilters(): void {
    if (this.prefill) {
      if (this.prefill.date) {
        this.selectedDate = this.prefill.date.startedDate;
        this.addPluginFilter(this.prefill.date);
      }

      if (this.prefill.plugin) {
        this.selectedPlugin = this.prefill.plugin;
        this.getXMLSamples(this.prefill.plugin);
      }
    }
  }

  /** expandSample
  /* expand the editor, so you can view more lines of code
  /* only one sample can be expanded
  /* @param {number} index - index of sample to expand
  */
  expandSample(index: number): void {
    const sample = this.allSamples[index]['xmlRecord'];
    const samples = this.undoNewLines(this.allSamples);
    this.allSamples[index]['xmlRecord'] = '';
    this.expandedSample = this.expandedSample === index ? undefined : index;
    setTimeout(() => {
      samples[index]['xmlRecord'] = sample;
    }, 500);
  }

  undoNewLines(samples: XmlSample[]): XmlSample[] {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i]['xmlRecord'] = samples[i]['xmlRecord'].replace(/[\r\n]/g, '').trim();
    }
    return clearSamples;
  }

  /** gotoMapping
  /* go to mapping tab, after transformation on the fly
  */
  gotoMapping(): void {
    this.router.navigate(['/dataset/mapping/' + this.datasetData.datasetId]);
  }

  /** toggleFilterDate
  /* show or hide date filter
  */
  toggleFilterDate(): void {
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
  toggleFilterPlugin(): void {
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
  onClickedOutside(e?: Event): void {
    this.filterDate = false;
    this.filterPlugin = false;
  }

  // if the click is on a http(s) link, open the link in a new tab
  handleCodeClick(event: MouseEvent): void {
    const target: Element = event.target as Element;
    if (target && target.classList.contains('cm-string')) {
      const text = target.textContent || '';
      const match = /^"(https?:\/\/\S+)"$/.exec(text);
      if (match) {
        window.open(match[1], '_blank');
      }
    }
  }
}
