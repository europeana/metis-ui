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
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as beautify from 'vkbeautify';
import { environment } from '../../../environments/environment';
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
    private readonly workflows: WorkflowService,
    private readonly translate: TranslateService,
    private readonly editorPrefs: EditorPrefService,
    private readonly errors: ErrorService,
    private readonly datasets: DatasetsService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer
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
  isLoadingFilter: boolean;
  loadingTransformSamples = false;
  downloadUrlCache: { [key: string]: string } = {};
  executionsFilterTimer: Subscription;
  pluginsFilterTimer: Subscription;

  /** ngOnInit
  /* - load the config
  *  - prepare translated messages
  *  - begin timer on available workflow executions
  *  - prefill the filters
  *  - transform any set tempXSLT
  */
  ngOnInit(): void {
    this.editorConfig = this.editorPrefs.getEditorConfig(true);
    this.nosample = this.translate.instant('noSample');

    this.executionsFilterTimer = timer(0, environment.intervalStatusMedium).subscribe(() => {
      this.addExecutionsFilter();
    });

    this.prefillFilters();

    if (this.tempXSLT) {
      this.transformSamples(this.tempXSLT);
    }
  }

  /** ngOnDestroy
   *  - revoke created urls
   *  - unsubscrube from the filters
   */
  ngOnDestroy(): void {
    Object.keys(this.downloadUrlCache).forEach((key) => {
      const url = this.downloadUrlCache[key];
      URL.revokeObjectURL(url);
    });

    this.unsubscribeFilters([this.executionsFilterTimer, this.pluginsFilterTimer]);
  }

  /** unsubscribeFilters
  /* unsubscrube from the specified filters
  */
  unsubscribeFilters(filterSubscriptions: Array<Subscription>): void {
    filterSubscriptions
      .filter((x) => {
        // remove any nulls
        return x;
      })
      .forEach((fs) => {
        fs.unsubscribe();
      });
  }

  /** addExecutionsFilter
  /* - populate a filter with executions based on the selected workflow
  /* - update load-tracking variable
  */
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

  /** addPluginsFilter
  /* - populate a filter with plugins based on selected execution
  *  - unsubscribe immediately if all plugins have completed
  */
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

    // unsubscribe from any previous subscription
    this.unsubscribeFilters([this.pluginsFilterTimer]);

    this.pluginsFilterTimer = timer(0, environment.intervalStatusMedium).subscribe(() => {
      this.isLoadingFilter = true;
      this.workflows.getExecutionPlugins(this.filteredExecutionId).subscribe(
        (result) => {
          let pluginsFilterComplete = true;
          this.isLoading = false;
          this.isLoadingFilter = false;
          this.allPlugins.length = 0;

          result.plugins.forEach((pa) => {
            if (!pa.hasSuccessfulData) {
              pluginsFilterComplete = false;
            }
            this.allPlugins.push({
              type: pa.pluginType,
              error: !pa.hasSuccessfulData
            });
          });

          if (pluginsFilterComplete) {
            // unsubscribe immediately
            this.pluginsFilterTimer.unsubscribe();
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this.isLoading = false;
          this.errors.handleError(err);
        }
      );
    });
  }

  /** errorHandling
  /* generic http error handler:
  /* - update load-tracking variable
  /* - set notification variable to new http error notification based on specified error
  */
  errorHandling(err: HttpErrorResponse): void {
    const error = this.errors.handleError(err);
    this.notification = httpErrorNotification(error);
    this.isLoading = false;
  }

  /** addPluginsFilter
  /* - populate a filter with plugins based on selected execution
  *  - unsubscribe immediately if all plugins have completed
  */
  getXMLSamplesCompare(plugin: PluginType, workflowExecutionId: string): void {
    this.filterCompareOpen = false;
    this.isLoading = true;
    this.allSampleComparisons = [];
    this.workflows
      .getWorkflowComparisons(workflowExecutionId, plugin, this.sampleRecordIds)
      .subscribe((result) => {
        // strip "new lines"
        this.allSampleComparisons = this.undoNewLines(result);
        this.isLoading = false;
        this.selectedComparison = plugin;
      }, this.errorHandling);
  }

  /** getXMLSamples
  /* - closes open dropdowns
  *  - get and show samples based on plugin
  *  - loads historyVersions based on plugin
  */
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

  /** transformSamples
  /* - transform samples on the fly based on temp saved XSLT
  */
  transformSamples(type: string): void {
    const handleError = (err: HttpErrorResponse): void => {
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

  /** prefillFilters
  /* prefill the filters when temporarily saved options are available
  */
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

  /** expandSample
  /* - expand the editor, so you can view more lines of code
  *  - only one sample can be expanded at any given moment
  */
  expandSample(index: number): void {
    const sample = this.allSamples[index].xmlRecord;
    const samples = this.undoNewLines(this.allSamples);
    this.allSamples[index].xmlRecord = '';
    this.expandedSample = this.expandedSample === index ? undefined : index;
    samples[index].xmlRecord = sample;
  }

  /** onThemeSet
  /* sets the theme to the default or the alternative
  */
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

  /** undoNewLines
  /* clears new-line markers in the specified samples
  */
  undoNewLines(samples: XmlSample[]): XmlSample[] {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i].xmlRecord = samples[i].xmlRecord.replace(/[\r\n]/g, '').trim();
    }
    return clearSamples;
  }

  /** gotoMapping
  /* redirects to the mapping
  */
  gotoMapping(): void {
    this.router.navigate(['/dataset/mapping/' + this.datasetData.datasetId]);
  }

  /** toggleFilterDate
  /* toggles the date filter open state
  */
  toggleFilterDate(): void {
    this.onClickedOutside();
    this.filterDateOpen = !this.filterDateOpen;
  }

  /** toggleFilterPlugin
  /* toggles the plugin filter open state
  */
  toggleFilterPlugin(): void {
    this.onClickedOutside();
    this.filterPluginOpen = !this.filterPluginOpen;
  }

  /** toggleFilterCompare
  /* toggles the compare filter open state
  */
  toggleFilterCompare(): void {
    this.onClickedOutside();
    this.filterCompareOpen = !this.filterCompareOpen;
  }

  /** onClickedOutside
  /* close all open filters
  */
  onClickedOutside(): void {
    this.filterDateOpen = false;
    this.filterPluginOpen = false;
    this.filterCompareOpen = false;
  }

  /** extractLinkFromElement
  /* uses regex to get link from markup
  */
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

  /** handleCodeClick
  /* if the click is on a http(s) link, open the link in a new tab
  */
  handleCodeClick(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      window.open(link, '_blank');
    }
  }

  /** clearLinkActive
  /* removes css class from elements within specified element
  */
  private clearLinkActive(element: Element): void {
    Array.from(element.querySelectorAll('.link-active')).forEach((link) => {
      link.classList.remove('link-active');
    });
  }

  /** handleMouseOver
  /* adds css class to target element of specified element if link present
  */
  handleMouseOver(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      this.clearLinkActive(event.currentTarget as Element);
      target.classList.add('link-active');
    }
  }

  /** handleMouseOut
  /* clears the active css class from hovered element containing link
  */
  handleMouseOut(event: MouseEvent): void {
    const target = event.target as Element;
    const link = this.extractLinkFromElement(target);
    if (link) {
      this.clearLinkActive(event.currentTarget as Element);
    }
  }

  /** byId
  /* returns item by id
  */
  byId(_: number, item: WorkflowExecution): string {
    return item.id;
  }

  /** downloadUrl
  /* returns the download url
  */
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
