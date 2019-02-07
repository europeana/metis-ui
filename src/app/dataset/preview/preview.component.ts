import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChildren, QueryList } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { EditorConfiguration } from 'codemirror';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/mode/xml/xml';
import { switchMap } from 'rxjs/operators';
import * as beautify from 'vkbeautify';

import {
  Dataset,
  httpErrorNotification,
  Notification,
  PluginType,
  WorkflowExecution,
  XmlSample,
} from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { PreviewFilters } from '../dataset.component';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy {
  constructor(
    private workflows: WorkflowService,
    private translate: TranslateService,
    private errors: ErrorService,
    private datasets: DatasetsService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  @Input() datasetData: Dataset;
  @Input() previewFilters: PreviewFilters;
  @Input() tempXSLT?: string;

  @Output() setPreviewFilters = new EventEmitter<PreviewFilters>();

  @ViewChildren('editor_1, editor_2') editors: QueryList<any>
  @ViewChildren('editor_pair_before') editors_before: QueryList<any>
  @ViewChildren('editor_pair_after') editors_after: QueryList<any>

  editorConfig: EditorConfiguration;
  allWorkflowExecutions: Array<WorkflowExecution> = [];
  allPlugins: Array<{ type: PluginType; error: boolean }> = [];
  allSamples: Array<XmlSample> = [];
  allTransformedSamples: XmlSample[];
  filterDate = false;
  filterPlugin = false;
  selectedDate: string;
  selectedPlugin?: string;
  expandedSample?: number;
  nosample: string;
  notification?: Notification;
  execution: WorkflowExecution;
  loadingSamples = false;
  loadingTransformSamples = false;
  timeout?: number;
  downloadUrlCache: { [key: string]: string } = {};

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
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    };

    this.nosample = this.translate.instant('nosample');

    this.addExecutionsFilter();

    this.prefillFilters();

    if (this.tempXSLT) {
      this.transformSamples(this.tempXSLT);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);

    Object.keys(this.downloadUrlCache).forEach((key) => {
      const url = this.downloadUrlCache[key];
      URL.revokeObjectURL(url);
    });
  }

  // populate a filter with executions based on selected workflow
  addExecutionsFilter(): void {
    this.workflows.getDatasetExecutionsCollectingPages(this.datasetData.datasetId).subscribe(
      (result) => {
        this.allWorkflowExecutions = result;
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      },
    );
  }

  // populate a filter with plugins based on selected execution
  addPluginsFilter(execution: WorkflowExecution): void {
    this.filterDate = false;
    this.allPlugins = [];
    this.execution = execution;
    this.selectedDate = execution.startedDate;
    this.previewFilters.execution = execution;
    this.setPreviewFilters.emit(this.previewFilters);
    for (let i = 0; i < execution.metisPlugins.length; i++) {
      if (execution.metisPlugins[i].pluginStatus === 'FINISHED') {
        this.allPlugins.push({
          type: execution.metisPlugins[i].pluginType,
          error: false,
        });
      } else {
        if (
          execution.metisPlugins[i].executionProgress.processedRecords >
          execution.metisPlugins[i].executionProgress.errors
        ) {
          this.allPlugins.push({
            type: execution.metisPlugins[i].pluginType,
            error: false,
          });
        } else {
          this.allPlugins.push({
            type: execution.metisPlugins[i].pluginType,
            error: true,
          });
        }
      }
    }
  }

  // get and show samples based on plugin
  getXMLSamples(plugin: PluginType): void {
    this.loadingSamples = true;
    this.onClickedOutside();
    this.selectedPlugin = plugin;
    this.previewFilters.plugin = plugin;
    this.setPreviewFilters.emit(this.previewFilters);
    this.workflows.getWorkflowSamples(this.execution.id, plugin).subscribe(
      (result) => {
        this.allSamples = this.undoNewLines(result);
        if (this.allSamples.length === 1) {
          this.expandedSample = 0;
        }
        this.loadingSamples = false;
      },
      (err: HttpErrorResponse) => {
        const error = this.errors.handleError(err);
        this.notification = httpErrorNotification(error);
        this.loadingSamples = false;
      },
    );
  }

  // transform samples on the fly based on temp saved XSLT
  transformSamples(type: string): void {
    const handleError = (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);
      this.loadingTransformSamples = false;
    };

    this.loadingTransformSamples = true;
    this.workflows
      .getFinishedDatasetExecutions(this.datasetData.datasetId, 0)
      .subscribe((result) => {
        if (!result.results[0]) {
          this.loadingTransformSamples = false;
          return;
        }
        this.workflows
          .getWorkflowSamples(result.results[0].id, result.results[0].metisPlugins[0].pluginType)
          .pipe(
            switchMap((samples) => {
              this.allSamples = this.undoNewLines(samples);
              return this.datasets.getTransform(this.datasetData.datasetId, samples, type);
            }),
          )
          .subscribe((transformed) => {
            this.allTransformedSamples = this.undoNewLines(transformed);
            this.loadingTransformSamples = false;
          }, handleError);
      }, handleError);
  }

  // prefill filters, when temporarily saved options are available
  prefillFilters(): void {
    const execution = this.previewFilters.execution;
    if (execution) {
      this.selectedDate = execution.startedDate;
      this.addPluginsFilter(execution);
    }

    const plugin = this.previewFilters.plugin;
    if (plugin) {
      this.selectedPlugin = plugin;
      this.getXMLSamples(plugin);
    }
  }

  // expand the editor, so you can view more lines of code
  // only one sample can be expanded
  expandSample(index: number): void {
    const sample = this.allSamples[index].xmlRecord;
    const samples = this.undoNewLines(this.allSamples);
    this.allSamples[index].xmlRecord = '';
    this.expandedSample = this.expandedSample === index ? undefined : index;
    this.timeout = window.setTimeout(() => {
      samples[index].xmlRecord = sample;
    }, 1);
  }

  swapTheme(index: number):void{
    const editor = this.editors.toArray()[index]
    const currTheme: string = editor.instance.getOption('theme');

    if(!currTheme || currTheme === 'default'){
      editor.instance.setOption('theme', 'isotope')
    }
    else{
      editor.instance.setOption('theme', 'default')
    }
  }

  swapThemePair(index: number):void{

    const swapEditors = [ this.editors_before.toArray()[index], this.editors_after.toArray()[index]];
    const currTheme: string = swapEditors[0].instance.getOption('theme');
    const newTheme: string = !currTheme || currTheme === 'default' ? 'isotope' : 'default';

    swapEditors.forEach((editor) => {
      editor.instance.setOption('theme', newTheme);
    });
  }

  undoNewLines(samples: XmlSample[]): XmlSample[] {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i].xmlRecord = samples[i].xmlRecord.replace(/[\r\n]/g, '').trim();
    }
    return clearSamples;
  }

  gotoMapping(): void {
    this.router.navigate(['/dataset/mapping/' + this.datasetData.datasetId]);
  }

  toggleFilterDate(): void {
    this.onClickedOutside();
    this.allPlugins = [];
    this.selectedPlugin = undefined;
    this.filterDate = !this.filterDate;
  }

  toggleFilterPlugin(): void {
    this.onClickedOutside();
    this.filterPlugin = !this.filterPlugin;
  }

  // close all open filters when click outside the filters
  onClickedOutside(): void {
    this.filterDate = false;
    this.filterPlugin = false;
  }

  private extractLinkFromElement(element: Element): string | undefined {
    if (element && element.classList.contains('cm-string')) {
      const text = element.textContent || '';
      const match = /^"(https?:\/\/\S+)"$/.exec(text);
      if (match) {
        return match[1];
      }
    }
    return undefined;
  }

  // if the click is on a http(s) link, open the link in a new tab
  handleCodeClick(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      window.open(link, '_blank');
    }
  }

  private clearLinkActive(element: Element): void {
    Array.from(element.querySelectorAll('.link-active')).forEach((link) => {
      link.classList.remove('link-active');
    });
  }

  handleMouseOver(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      this.clearLinkActive(event.currentTarget as Element);
      target.classList.add('link-active');
    }
  }

  handleMouseOut(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      this.clearLinkActive(event.currentTarget as Element);
    }
  }

  byId(_: number, item: WorkflowExecution): string {
    return item.id;
  }

  downloadUrl({ ecloudId, xmlRecord }: XmlSample, group: string = ''): SafeUrl {
    const key = `${group}:${ecloudId}`;
    let url = this.downloadUrlCache[key];
    if (!url) {
      const parts = [beautify.xml(xmlRecord)];
      const blob = new Blob(parts, { type: 'text/xml' });
      url = URL.createObjectURL(blob);
      this.downloadUrlCache[key] = url;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
