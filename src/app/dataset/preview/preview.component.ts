import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
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
import { CodemirrorComponent } from 'ng2-codemirror';
import { switchMap } from 'rxjs/operators';
import * as beautify from 'vkbeautify';

import {
  Dataset,
  HistoryVersion,
  httpErrorNotification,
  Notification,
  PluginType,
  PreviewFilters,
  WorkflowExecution,
  WorkflowExecutionHistory,
  XmlSample
} from '../../_models';
import { DatasetsService, EditorPrefService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnDestroy {
  constructor(
    private workflows: WorkflowService,
    private translate: TranslateService,
    private editorPrefs: EditorPrefService,
    private errors: ErrorService,
    private datasets: DatasetsService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  @Input() datasetData: Dataset;
  @Input() previewFilters: PreviewFilters;
  @Input() tempXSLT?: string;

  @Output() setPreviewFilters = new EventEmitter<PreviewFilters>();
  @ViewChildren(CodemirrorComponent) allEditors: QueryList<CodemirrorComponent>;

  editorConfig: EditorConfiguration;
  allWorkflowExecutions: Array<WorkflowExecutionHistory> = [];
  allPlugins: Array<{ type: PluginType; error: boolean }> = [];
  allSamples: Array<XmlSample> = [];
  allSampleComparisons: Array<XmlSample> = [];
  sampleRecordIds: Array<string> = [];
  allTransformedSamples: XmlSample[];
  filterCompareOpen = false;
  filterDateOpen = false;
  filterPluginOpen = false;
  historyVersions: Array<HistoryVersion>;
  selectedDate: string;
  selectedPlugin?: PluginType;
  selectedComparison?: string;
  expandedSample?: number;
  nosample: string;
  notification?: Notification;
  filteredExecutionId: string;
  isLoading = true;
  loadingTransformSamples = false;
  timeout?: number;
  downloadUrlCache: { [key: string]: string } = {};

  ngOnInit(): void {
    this.editorConfig = this.editorPrefs.getEditorConfig(true);
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
    this.workflows.getDatasetHistory(this.datasetData.datasetId).subscribe(
      (result) => {
        this.allWorkflowExecutions = result.executions;
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errors.handleError(err);
      }
    );
  }

  // populate a filter with plugins based on selected execution
  addPluginsFilter(executionHistory: WorkflowExecutionHistory): void {
    this.isLoading = true;
    this.filterDateOpen = false;
    this.selectedPlugin = undefined;
    this.allPlugins = [];
    this.historyVersions = [];
    this.allSamples = [];
    this.allSampleComparisons = [];
    this.filteredExecutionId = executionHistory.workflowExecutionId;
    this.selectedDate = executionHistory.startedDate;
    this.selectedComparison = undefined;
    this.previewFilters.executionId = executionHistory.workflowExecutionId;

    this.workflows.getExecutionPlugins(this.filteredExecutionId).subscribe(
      (result) => {
        this.isLoading = false;
        result.plugins.forEach((pa) => {
          this.allPlugins.push({
            type: pa.pluginType,
            error: !pa.hasSuccessfulData
          });
        });
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.isLoading = false;
        this.errors.handleError(err);
      }
    );
  }

  getComparePlugins(): Array<{ type: PluginType; error: boolean }> {
    return this.allPlugins;
  }

  errorHandling(err: HttpErrorResponse): void {
    const error = this.errors.handleError(err);
    this.notification = httpErrorNotification(error);
    this.isLoading = false;
  }

  getXMLSamplesCompare(plugin: PluginType, workflowExecutionId: string): void {
    this.filterCompareOpen = false;
    this.isLoading = true;
    this.allSampleComparisons = [];
    this.workflows
      .getWorkflowComparisons(workflowExecutionId, plugin, this.sampleRecordIds)
      .subscribe((result) => {
        this.allSampleComparisons = this.undoNewLines(result);
        this.isLoading = false;
        this.selectedComparison = plugin;
      }, this.errorHandling);
  }

  // get and show samples based on plugin
  getXMLSamples(plugin: PluginType): void {
    let loadingSamples = true;
    let loadingHistories = true;

    this.isLoading = true;
    this.allSampleComparisons = [];
    this.selectedComparison = undefined;

    this.onClickedOutside();
    this.editorConfig = this.editorPrefs.getEditorConfig(true);
    this.selectedPlugin = plugin;
    this.previewFilters.pluginType = plugin;
    this.setPreviewFilters.emit(this.previewFilters);

    this.workflows.getWorkflowSamples(this.filteredExecutionId, plugin).subscribe((result) => {
      this.allSamples = this.undoNewLines(result);

      if (this.allSamples.length === 1) {
        this.expandedSample = 0;
      }
      loadingSamples = false;
      if (!loadingHistories) {
        this.isLoading = false;
      }
      this.sampleRecordIds = [];
      this.allSamples.forEach((sample) => {
        this.sampleRecordIds.push(sample.ecloudId);
      });
    }, this.errorHandling);

    this.workflows.getVersionHistory(this.filteredExecutionId, plugin).subscribe((result) => {
      loadingHistories = false;
      if (!loadingSamples) {
        this.isLoading = false;
      }
      this.historyVersions = result;
    }, this.errorHandling);
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
            })
          )
          .subscribe((transformed) => {
            this.allTransformedSamples = this.undoNewLines(transformed);
            this.loadingTransformSamples = false;
          }, handleError);
      }, handleError);
  }

  // prefill filters, when temporarily saved options are available
  prefillFilters(): void {
    if (this.previewFilters && this.previewFilters.startedDate && this.previewFilters.executionId) {
      this.selectedDate = this.previewFilters.startedDate;
      this.addPluginsFilter({
        workflowExecutionId: this.previewFilters.executionId,
        startedDate: this.previewFilters.startedDate
      });
    }
    const pluginType = this.previewFilters.pluginType;
    if (pluginType) {
      this.selectedPlugin = pluginType;
      this.getXMLSamples(pluginType);
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

  onThemeSet(toDefault: boolean): void {
    const isDef = this.editorPrefs.currentThemeIsDefault();
    if (toDefault) {
      if (!isDef) {
        this.editorConfig.theme = this.editorPrefs.toggleTheme(this.allEditors);
      }
    } else {
      if (isDef) {
        this.editorConfig.theme = this.editorPrefs.toggleTheme(this.allEditors);
      }
    }
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
    this.filterDateOpen = !this.filterDateOpen;
  }

  toggleFilterPlugin(): void {
    this.onClickedOutside();
    this.filterPluginOpen = !this.filterPluginOpen;
  }

  toggleFilterCompare(): void {
    this.onClickedOutside();
    this.filterCompareOpen = !this.filterCompareOpen;
  }

  // close all open filters when click outside the filters
  onClickedOutside(): void {
    this.filterDateOpen = false;
    this.filterPluginOpen = false;
    this.filterCompareOpen = false;
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

  downloadUrl({ ecloudId, xmlRecord }: XmlSample, group = ''): SafeUrl {
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
