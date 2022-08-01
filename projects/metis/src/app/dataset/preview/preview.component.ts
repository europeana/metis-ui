import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, timer } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
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
  XmlDownload,
  XmlSample
} from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent extends SubscriptionManager implements OnInit, OnDestroy {
  public PluginType = PluginType;

  constructor(
    private readonly workflows: WorkflowService,
    private readonly translate: TranslateService,
    private readonly errors: ErrorService,
    private readonly datasets: DatasetsService,
    private readonly router: Router
  ) {
    super();
  }

  @Input() datasetData: Dataset;
  @Input() previewFilters: PreviewFilters;
  @Input() tempXSLT?: string;

  @Output() setPreviewFilters = new EventEmitter<PreviewFilters>();

  allWorkflowExecutions: Array<WorkflowExecutionHistory> = [];
  allPlugins: Array<{ type: PluginType; error: boolean }> = [];

  allSamples: Array<XmlSample> = [];
  allSampleComparisons: Array<XmlSample> = [];

  searchedXMLSample?: XmlDownload;
  searchedXMLSampleCompare?: XmlDownload;
  searchedXMLSampleExpanded = false;
  searchError = false;
  searchTerm = '';

  allTransformedSamples: XmlSample[];
  filterCompareOpen = false;
  filterDateOpen = false;
  filterPluginOpen = false;
  historyVersions: Array<HistoryVersion>;
  expandedSample?: number;
  nosample: string;
  notification?: Notification;
  isLoadingComparisons = false;
  isLoadingFilter = false;
  isLoadingHistories = false;
  isLoadingSearch = false;
  isLoadingSamples = false;
  isLoadingTransformSamples = false;
  downloadUrlCache: { [key: string]: string } = {};
  serviceTimer: Observable<number>;
  pluginsFilterSubscription: Subscription;

  /** ngOnInit
  /* - load the config
  *  - prepare translated messages
  *  - begin timer on available workflow executions
  *  - prefill the filters
  *  - transform any set tempXSLT
  */
  ngOnInit(): void {
    this.nosample = this.translate.instant('noSample');

    this.serviceTimer = timer(0, environment.intervalStatusMedium);
    this.subs.push(
      this.serviceTimer.subscribe(() => {
        this.addExecutionsFilter();
      })
    );
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
    if (this.pluginsFilterSubscription) {
      this.pluginsFilterSubscription.unsubscribe();
    }
    this.cleanup();
  }

  /** addExecutionsFilter
  /* - populate a filter with executions based on the selected workflow
  /* - update load-tracking variable
  */
  addExecutionsFilter(): void {
    this.isLoadingFilter = true;
    this.subs.push(
      this.workflows.getDatasetHistory(this.datasetData.datasetId).subscribe(
        (result) => {
          this.allWorkflowExecutions = result.executions;
          this.isLoadingFilter = false;
        },
        (err: HttpErrorResponse) => {
          this.isLoadingFilter = false;
          this.errors.handleError(err);
        }
      )
    );
  }

  isLoading(): boolean {
    return (
      this.isLoadingComparisons ||
      this.isLoadingFilter ||
      this.isLoadingHistories ||
      this.isLoadingSamples ||
      this.isLoadingTransformSamples
    );
  }

  /** addPluginsFilter
  /* - populate a filter with plugins based on selected execution date
  *  - unsubscribe immediately if all plugins have completed
  */
  addPluginsFilter(executionHistory: WorkflowExecutionHistory, prefilling = false): void {
    this.isLoadingFilter = true;
    this.filterDateOpen = false;
    this.allPlugins = [];
    this.historyVersions = [];
    this.allSamples = [];
    this.allSampleComparisons = [];
    if (!prefilling) {
      this.previewFilters = {
        baseFilter: {
          executionId: executionHistory.workflowExecutionId
        },
        baseStartedDate: executionHistory.startedDate
      };
      this.setPreviewFilters.emit(this.previewFilters);
    }

    // unsubscribe from any previous subscription
    const prevSub = this.pluginsFilterSubscription;
    if (prevSub) {
      prevSub.unsubscribe();
    }

    this.pluginsFilterSubscription = this.serviceTimer
      .pipe(
        switchMap(() => {
          return this.workflows.getExecutionPlugins(executionHistory.workflowExecutionId);
        })
      )
      .subscribe(
        (result) => {
          let pluginsFilterComplete = true;

          this.isLoadingFilter = false;
          this.allPlugins.length = 0;

          result.plugins.forEach((pa) => {
            if (!pa.canDisplayRawXml) {
              pluginsFilterComplete = false;
            }
            this.allPlugins.push({
              type: pa.pluginType,
              error: !pa.canDisplayRawXml
            });
          });
          if (pluginsFilterComplete) {
            // unsubscribe immediately
            this.pluginsFilterSubscription.unsubscribe();
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this.isLoadingFilter = false;
          this.errors.handleError(err);
        }
      );
  }

  /** getXMLSamplesCompare
  /* - populate a filter with plugins based on selected plugin for XML comparison
  */
  getXMLSamplesCompare(plugin: PluginType, workflowExecutionId: string, prefilling = false): void {
    if (!prefilling) {
      this.filterCompareOpen = false;
      this.previewFilters.comparisonFilter = {
        pluginType: plugin,
        executionId: workflowExecutionId
      };
      this.setPreviewFilters.emit(this.previewFilters);
    }
    this.allSampleComparisons = [];

    const sampleRecordIds = this.previewFilters.sampleRecordIds;
    if (sampleRecordIds) {
      this.isLoadingComparisons = true;
      this.subs.push(
        this.workflows
          .getWorkflowRecordsById(workflowExecutionId, plugin, sampleRecordIds)
          .subscribe(
            (result) => {
              // strip "new lines"
              this.allSampleComparisons = this.processXmlSamples(result, plugin);
              this.isLoadingComparisons = false;
            },
            (err: HttpErrorResponse): void => {
              const error = this.errors.handleError(err);
              this.notification = httpErrorNotification(error);
              this.isLoadingComparisons = false;
            }
          )
      );
      this.searchXMLSample(this.searchTerm, true);
    }
  }

  /** getComparisonSampleAtIndex
   * @param { number } index - the array index
   * @returns XmlSample or null
   **/
  getComparisonSampleAtIndex(index: number): XmlSample | null {
    if (this.allSampleComparisons.length >= index) {
      return this.allSampleComparisons[index];
    }
    return null;
  }

  /** getXMLSamples
   * (closes open dropdowns) and gets the samples based on plugin
   * then loads historyVersions (possible comparisons) based on plugin
   * @param { PluginType } plugin - the plugin type
   * @param { boolean } prefilling - flag ig pre-filling the UI
   **/
  getXMLSamples(plugin: PluginType, prefilling = false): void {
    if (!prefilling) {
      this.onClickedOutside();
      this.allSampleComparisons = [];
      this.searchedXMLSampleCompare = undefined;

      this.previewFilters.comparisonFilter = undefined;
      this.previewFilters.sampleRecordIds = [];
      this.previewFilters.baseFilter.pluginType = plugin;

      this.setPreviewFilters.emit(this.previewFilters);
    }

    const executionId = this.previewFilters.baseFilter.executionId;

    if (!executionId) {
      return;
    }
    this.isLoadingSamples = true;
    this.subs.push(
      this.workflows.getWorkflowSamples(executionId, plugin).subscribe(
        (result) => {
          this.isLoadingSamples = false;
          this.allSamples = this.processXmlSamples(result, plugin);
          if (this.allSamples.length === 1) {
            this.expandedSample = 0;
          }
          this.previewFilters.sampleRecordIds = this.allSamples.map((sample) => {
            return sample.ecloudId;
          });
        },
        (err: HttpErrorResponse): void => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
          this.isLoadingSamples = false;
        }
      )
    );
    this.getVersions(plugin, executionId);
    this.searchXMLSample(this.searchTerm);
  }

  /** getVersions
   * loads historyVersions (possible comparisons)
   * @param { PluginType } plugin - the plugin type
   * @param { string } executionId -
   **/
  getVersions(plugin: PluginType, executionId: string): void {
    this.isLoadingHistories = true;
    this.subs.push(
      this.workflows.getVersionHistory(executionId, plugin).subscribe(
        (result) => {
          this.historyVersions = result;
          this.isLoadingHistories = false;
        },
        (err: HttpErrorResponse): void => {
          const error = this.errors.handleError(err);
          this.notification = httpErrorNotification(error);
          this.isLoadingHistories = false;
        }
      )
    );
  }

  /** transformSamples
   * - transform samples on the fly based on temp saved XSLT
   * @param { string } type - the plugin type
   **/
  transformSamples(type: string): void {
    this.isLoadingTransformSamples = true;
    const handleError = (err: HttpErrorResponse): void => {
      const error = this.errors.handleError(err);
      this.notification = httpErrorNotification(error);
      this.isLoadingTransformSamples = false;
    };
    this.subs.push(
      this.workflows
        .getFinishedDatasetExecutions(this.datasetData.datasetId, 0)
        .pipe(
          filter((result) => {
            if (result.results[0]) {
              return true;
            }
            this.isLoadingTransformSamples = false;
            return false;
          }),
          switchMap((result) => {
            return this.workflows
              .getWorkflowSamples(
                result.results[0].id,
                result.results[0].metisPlugins[0].pluginType
              )
              .pipe(
                switchMap((samples) => {
                  this.allSamples = this.processXmlSamples(samples, `${type}`);
                  return this.datasets.getTransform(this.datasetData.datasetId, samples, type);
                })
              );
          })
        )
        .subscribe((transformed) => {
          this.allTransformedSamples = this.processXmlSamples(transformed, 'transformed');
          this.isLoadingTransformSamples = false;
        }, handleError)
    );
  }

  /** prefillFilters
   * prefill the filters when temporarily saved options are available
   **/
  prefillFilters(): void {
    const prvCmp = this.previewFilters.comparisonFilter;
    const pluginType = this.previewFilters.baseFilter.pluginType;
    const executionId = this.previewFilters.baseFilter.executionId;
    const searchedRecordId = this.previewFilters.searchedRecordId;

    if (pluginType) {
      this.getXMLSamples(pluginType, true);

      if (prvCmp && prvCmp.pluginType && prvCmp.executionId) {
        this.getXMLSamplesCompare(prvCmp.pluginType, prvCmp.executionId, true);
        if (searchedRecordId) {
          this.searchTerm = searchedRecordId;
          this.searchXMLSample(searchedRecordId, true);
        }
      }
      if (executionId) {
        this.getVersions(pluginType, executionId);
      }
      if (searchedRecordId) {
        this.searchTerm = searchedRecordId;
        this.searchXMLSample(searchedRecordId, false);
      }
    }

    if (this.previewFilters.baseStartedDate && executionId) {
      this.addPluginsFilter(
        {
          workflowExecutionId: executionId,
          startedDate: this.previewFilters.baseStartedDate
        },
        true
      );
    }
  }

  /** expandSample
   * - expand the editor, so you can view more lines of code
   *  - resets to undefined if already set
   * @param { number } index - the expanded index
   **/
  expandSample(index: number): void {
    this.expandedSample = this.expandedSample === index ? undefined : index;
  }

  expandSearchSample(): void {
    this.searchedXMLSampleExpanded = !this.searchedXMLSampleExpanded;
  }

  /** processXmlSamples
  /* clears new-line markers in the specified samples
  */
  processXmlSamples(samples: XmlSample[], label: string): XmlDownload[] {
    const clearSamples = samples;
    for (let i = 0; i < samples.length; i++) {
      clearSamples[i].xmlRecord = samples[i].xmlRecord.replace(/[\r\n]/g, '').trim();
    }
    return clearSamples.map((xml: XmlSample) => {
      return Object.assign(xml, { label: label });
    });
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
   * returns item by id
   * @param {number} _ - unused
   * @param {WorkflowExecution} item - the item
   **/
  byId(_: number, item: WorkflowExecution): string {
    return item.id;
  }

  /** searchXMLSample
   * updates local searchTerm and optionally invokes search on it
   * updates local variables searchError / searchedXMLSample | searchedXMLSampleCompare
   * @param {string} searchTerm - the term
   **/
  searchXMLSample(searchTerm: string, comparison = false): void {
    this.searchTerm = searchTerm;

    if (searchTerm.length === 0) {
      if (this.previewFilters.searchedRecordId) {
        this.previewFilters.searchedRecordId = undefined;
        this.setPreviewFilters.emit(this.previewFilters);
      }
      this.searchedXMLSample = undefined;
      this.searchError = false;
      return;
    }

    const filterPlugin = comparison
      ? this.previewFilters.comparisonFilter
      : this.previewFilters.baseFilter;
    const pluginType = filterPlugin ? filterPlugin.pluginType : null;
    const executionId = this.previewFilters.baseFilter.executionId;

    if (executionId && pluginType) {
      this.searchError = false;
      this.isLoadingSearch = true;

      this.subs.push(
        this.workflows.getWorkflowRecordsById(executionId, pluginType, [searchTerm]).subscribe(
          (result: XmlSample[]) => {
            if (result.length) {
              const searchedSample = Object.assign(result[0], { label: searchTerm });
              if (comparison) {
                this.searchedXMLSampleCompare = searchedSample;
              } else {
                this.searchedXMLSample = searchedSample;
              }
              this.previewFilters.searchedRecordId = searchTerm;
              this.setPreviewFilters.emit(this.previewFilters);
            } else {
              this.searchError = true;
              this.searchedXMLSample = undefined;
            }
            this.isLoadingSearch = false;
          },
          (error: HttpErrorResponse) => {
            this.notification = httpErrorNotification(error);
            this.searchedXMLSample = undefined;
            this.isLoadingSearch = false;
          }
        )
      );
    }
  }
}
