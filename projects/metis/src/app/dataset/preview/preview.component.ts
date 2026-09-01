import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  model,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { Router } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { of, Subscription } from 'rxjs';
import { filter, repeat, switchMap, takeWhile } from 'rxjs/operators';

import { ClickAwareDirective } from 'shared';
import { environment } from '../../../environments/environment';
import { httpErrorNotification } from '../../_helpers';
import {
  Dataset,
  HistoryVersion,
  Notification,
  PluginAvailabilityList,
  PluginType,
  PreviewFilters,
  WorkflowExecution,
  WorkflowExecutionHistory,
  XmlDownload,
  XmlSample
} from '../../_models';
import { SampleResource } from '../../_resources';
import { WorkflowService } from '../../_services';
import {
  EditorSafeXmlPipe,
  RenameWorkflowPipe,
  TranslatePipe,
  TranslateService,
  XmlPipe
} from '../../_translate';
import { EditorComponent } from '../editor';
import { NotificationComponent } from '../../shared';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  imports: [
    ClickAwareDirective,
    EditorSafeXmlPipe,
    NotificationComponent,
    NgClass,
    EditorComponent,
    CodemirrorModule,
    FormsModule,
    DatePipe,
    TranslatePipe,
    XmlPipe,
    RenameWorkflowPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreviewComponent implements OnInit, OnDestroy {
  private readonly workflows = inject(WorkflowService);
  private readonly translate = inject(TranslateService);
  private readonly sampleResource = inject(SampleResource);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  public PluginType = PluginType;

  datasetData = input.required<Dataset>();
  tempXSLT = input<string | undefined>(undefined);
  previewFilters = model.required<PreviewFilters>();

  allTransformedSamples = this.sampleResource.transformedSamples;
  allOriginalSamples = this.sampleResource.originalSamples;
  transformationUnavailable = this.sampleResource.transformationUnavailable;
  notificationSamplesError = computed(() => {
    const errSamples = this.sampleResource.httpError();
    if (errSamples) {
      return httpErrorNotification(errSamples as HttpErrorResponse);
    }
    return undefined;
  });

  readonly allWorkflowExecutions = computed(() => {
    return this.datasetHistoryRaw()?.executions ?? [];
  });

  allPlugins = signal<Array<{ type: PluginType; error: boolean }>>([]);

  allSamples: Array<XmlSample> = [];
  allSampleComparisons: Array<XmlSample> = [];

  searchedXMLSample?: XmlDownload;
  searchedXMLSampleCompare?: XmlDownload;
  searchedXMLSampleExpanded = false;
  searchError = false;
  searchTerm = '';

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
  downloadUrlCache: { [key: string]: string } = {};

  private historyResource = rxResource({
    params: () => ({ id: this.datasetData().datasetId }),
    stream: (ctx: { params: { id: string } }) =>
      this.workflows
        .getDatasetHistory(ctx.params.id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          repeat({ delay: environment.intervalStatusMedium })
        )
  });

  private readonly datasetHistoryRaw = signal<
    { executions: WorkflowExecutionHistory[] } | undefined
  >(undefined);
  private readonly activeExecutionId = signal<string | undefined>(undefined);

  private readonly pluginsResource = rxResource<PluginAvailabilityList, { id: string } | undefined>(
    {
      params: () => {
        const execId = this.activeExecutionId();
        if (!execId) {
          return undefined;
        }
        return { id: execId };
      },
      stream: (ctx) => {
        if (!ctx.params) {
          return of({ plugins: [] });
        }

        return this.workflows.getExecutionPlugins(ctx.params.id).pipe(
          takeUntilDestroyed(this.destroyRef),
          repeat({ delay: environment.intervalStatusMedium }),
          takeWhile((result) => {
            if (!result || !result.plugins) return true;
            return !result.plugins.every((pa) => pa.canDisplayRawXml);
          }, true)
        );
      }
    }
  );

  pluginsFilterSubscription: Subscription;

  constructor() {
    effect(() => {
      const xsltValue = this.tempXSLT();
      if (xsltValue) {
        this.sampleResource.xslt.set(xsltValue);
        this.sampleResource.datasetId.set(this.datasetData().datasetId);
      }
    });

    effect(() => {
      const result = this.pluginsResource.value();
      if (result && result.plugins) {
        this.isLoadingFilter = false;

        this.allPlugins.set(
          result.plugins.map((pa) => ({
            type: pa.pluginType,
            error: !pa.canDisplayRawXml
          }))
        );

        const pluginsFilterComplete = result.plugins.every((pa) => pa.canDisplayRawXml);
        if (pluginsFilterComplete) {
          this.activeExecutionId.set(undefined);
        }
      }
    });
  }

  /** ngOnInit
   **/
  ngOnInit(): void {
    this.nosample = this.translate.instant('noSample');
    this.prefillFilters();

    toObservable(this.activeExecutionId, { injector: this.injector })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((execId): execId is string => !!execId),
        switchMap((execId) =>
          this.workflows.getExecutionPlugins(execId).pipe(
            repeat({ delay: environment.intervalStatusMedium }),
            takeWhile((result) => {
              if (!result || !result.plugins) return true;
              return !result.plugins.every((pa) => pa.canDisplayRawXml);
            }, true)
          )
        )
      )
      .subscribe({
        next: (result) => {
          if (result && result.plugins) {
            this.isLoadingFilter = false;

            this.allPlugins.set(
              result.plugins.map((pa) => ({
                type: pa.pluginType,
                error: !pa.canDisplayRawXml
              }))
            );

            if (result.plugins.every((pa) => pa.canDisplayRawXml)) {
              this.activeExecutionId.set(undefined);
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Plugin tracking error:', err);
          this.isLoadingFilter = false;
        }
      });

    this.workflows
      .getDatasetHistory(this.datasetData().datasetId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        repeat({ delay: environment.intervalStatusMedium })
      )
      .subscribe({
        next: (historyData) => {
          this.datasetHistoryRaw.set(historyData);
        },
        error: (err: HttpErrorResponse) => {
          console.error('History tracking error:', err);
        }
      });
  }

  ngOnDestroy(): void {
    Object.keys(this.downloadUrlCache).forEach((key) => {
      const url = this.downloadUrlCache[key];
      URL.revokeObjectURL(url);
    });
    if (this.pluginsFilterSubscription) {
      this.pluginsFilterSubscription.unsubscribe();
    }
  }

  addExecutionsFilter(): void {
    this.isLoadingFilter = true;
    const history = this.historyResource.value();
    if (history) {
      this.isLoadingFilter = false;
    }
  }

  isLoading(): boolean {
    return (
      this.isLoadingComparisons ||
      this.isLoadingFilter ||
      this.isLoadingHistories ||
      this.isLoadingSamples ||
      this.allTransformedSamples.isLoading()
    );
  }

  /** addPluginsFilter
  /* - populate a filter with plugins based on selected execution date
  */
  addPluginsFilter(executionHistory: WorkflowExecutionHistory, prefilling = false): void {
    this.isLoadingFilter = true;
    this.filterDateOpen = false;
    this.allPlugins.set([]);
    this.historyVersions = [];
    this.allSamples = [];
    this.allSampleComparisons = [];

    if (!executionHistory) {
      this.isLoadingFilter = false;
      return;
    }

    if (!prefilling) {
      this.previewFilters.set({
        baseFilter: {
          executionId: executionHistory.workflowExecutionId
        },
        baseStartedDate: executionHistory.startedDate,
        sampleRecordIds: []
      });
    }

    this.activeExecutionId.set(executionHistory.workflowExecutionId);
  }

  getXMLSamplesCompare(plugin: PluginType, workflowExecutionId: string, prefilling = false): void {
    if (!prefilling) {
      this.filterCompareOpen = false;
      this.previewFilters.update((current) => ({
        ...current,
        comparisonFilter: {
          pluginType: plugin,
          executionId: workflowExecutionId
        }
      }));
    }
    this.allSampleComparisons = [];

    const sampleRecordIds = this.previewFilters().sampleRecordIds;
    if (sampleRecordIds) {
      this.isLoadingComparisons = true;
      this.workflows
        .getWorkflowRecordsById(workflowExecutionId, plugin, sampleRecordIds)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            this.allSampleComparisons = SampleResource.processXmlSamples(result, plugin);
            this.isLoadingComparisons = false;
          },
          error: (err: HttpErrorResponse): void => {
            this.notification = httpErrorNotification(err);
            this.isLoadingComparisons = false;
          }
        });
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
   * @param { boolean } prefilling - flag if pre-filling the UI
   **/
  getXMLSamples(plugin: PluginType, prefilling = false): void {
    if (!prefilling) {
      this.onClickedOutside();
      this.allSampleComparisons = [];
      this.searchedXMLSampleCompare = undefined;

      this.previewFilters.update((current) => ({
        ...current,
        comparisonFilter: undefined,
        sampleRecordIds: [],
        baseFilter: {
          ...current.baseFilter,
          pluginType: plugin
        }
      }));
    }

    const executionId = this.previewFilters().baseFilter.executionId;
    if (!executionId) {
      return;
    }

    this.isLoadingSamples = true;
    this.workflows
      .getWorkflowSamples(executionId, plugin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isLoadingSamples = false;
          this.allSamples = SampleResource.processXmlSamples(result, plugin);
          if (this.allSamples.length === 1) {
            this.expandedSample = 0;
          }

          this.previewFilters.update((current) => ({
            ...current,
            sampleRecordIds: this.allSamples.map((sample) => sample.ecloudId)
          }));
        },
        error: (err: HttpErrorResponse): void => {
          this.notification = httpErrorNotification(err);
          this.isLoadingSamples = false;
        }
      });
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
    this.workflows
      .getVersionHistory(executionId, plugin)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.historyVersions = result;
          this.isLoadingHistories = false;
        },
        error: (err: HttpErrorResponse): void => {
          this.notification = httpErrorNotification(err);
          this.isLoadingHistories = false;
        }
      });
  }

  /** prefillFilters
   * prefill the filters when temporarily saved options are available
   **/
  prefillFilters(): void {
    const filters = this.previewFilters();
    const prvCmp = filters.comparisonFilter;
    const pluginType = filters.baseFilter.pluginType;
    const executionId = filters.baseFilter.executionId;
    const searchedRecordId = filters.searchedRecordId;

    if (pluginType) {
      this.getXMLSamples(pluginType, true);
      if (prvCmp?.pluginType && prvCmp?.executionId) {
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
        this.searchXMLSample(searchedRecordId);
      }
    }

    if (filters.baseStartedDate && executionId) {
      this.addPluginsFilter(
        { workflowExecutionId: executionId, startedDate: filters.baseStartedDate },
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

  /** clearTransformation
   *
   * reset the sampleResource data
   **/
  clearTransformation(): void {
    this.sampleResource.xslt.set('');
  }

  /** gotoMapping
  /* redirects to the mapping
  */
  gotoMapping(): void {
    this.router.navigate(['/dataset/mapping/' + this.datasetData().datasetId]);
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
    if (element?.classList.contains('cm-string')) {
      const text: string = element.textContent ?? '';
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
   * @param {boolean} comparison - flag if comparison is to be searched / assigned
   **/
  searchXMLSample(searchTerm: string, comparison = false): void {
    this.searchTerm = searchTerm;

    if (searchTerm.length === 0) {
      if (this.previewFilters().searchedRecordId) {
        this.previewFilters.update((current) => ({ ...current, searchedRecordId: undefined }));
      }
      this.searchedXMLSample = undefined;
      this.searchError = false;
      return;
    }

    const filterPlugin = comparison
      ? this.previewFilters().comparisonFilter
      : this.previewFilters().baseFilter;
    const pluginType = filterPlugin ? filterPlugin.pluginType : null;
    const executionId = filterPlugin ? filterPlugin.executionId : undefined;

    if (!(executionId && pluginType)) {
      return;
    }

    this.searchError = false;
    this.isLoadingSearch = true;

    this.workflows
      .searchWorkflowRecordsById(executionId, pluginType, searchTerm)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: XmlSample) => {
          if (result) {
            this.previewFilters.update((current) => ({ ...current, searchedRecordId: searchTerm }));
            const searchedSample = { ...result, label: searchTerm };
            if (comparison) {
              this.searchedXMLSampleCompare = searchedSample;
            } else {
              this.searchedXMLSample = searchedSample;
            }
          } else {
            this.previewFilters.update((current) => ({ ...current, searchedRecordId: undefined }));
            this.searchError = true;
            this.searchedXMLSample = undefined;
          }
          this.isLoadingSearch = false;
        },
        error: (error: HttpErrorResponse) => {
          this.notification = httpErrorNotification(error);
          this.searchedXMLSample = undefined;
          this.isLoadingSearch = false;
        }
      });
  }
}
