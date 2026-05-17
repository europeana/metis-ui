import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { Observable, of } from 'rxjs';
import { SubscriptionManager } from 'shared';
import { IsScrollableDirective } from '../_directives';
import { getLowestValues, sanitiseSearchTerm } from '../_helpers';
import {
  LicenseType,
  PagerInfo,
  SortDirection,
  TierDimension,
  TierGridValue,
  TierSummaryBase,
  TierSummaryRecord
} from '../_models';
import { SandboxService } from '../_services';
import { FormatLicensePipe, FormatTierDimensionPipe, HighlightMatchPipe } from '../_translate';
import { PieComponent } from '../chart/pie/pie.component';
import { GridPaginatorComponent } from '../grid-paginator';

@Component({
  selector: 'sb-dataset-content-summary',
  templateUrl: './dataset-content-summary.component.html',
  styleUrls: ['./dataset-content-summary.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    PieComponent,
    NgTemplateOutlet,
    FormsModule,
    NgFor,
    GridPaginatorComponent,
    FormatLicensePipe,
    FormatTierDimensionPipe,
    HighlightMatchPipe,
    IsScrollableDirective
  ]
})
export class DatasetContentSummaryComponent extends SubscriptionManager {
  private readonly sandbox = inject(SandboxService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  public readonly LicenseType = LicenseType;
  public readonly SortDirection = SortDirection;

  // 🚀 THE TYPE INJECTION FIX: Standardized to string to match parent routing context perfectly
  public readonly datasetId = input.required<string>();
  public readonly isVisible = input<boolean>(false);
  public readonly recordHighlightRequest = input<string | undefined>();

  public readonly gridData = signal<Array<TierSummaryRecord>>([]);
  public readonly gridDataRaw = signal<Array<TierSummaryRecord>>([]);

  // 🚀 TYPE INJECTION FIX: Standardized string cache tracker to prevent HTTP 400 parameter mutations
  public readonly lastLoadedId = signal<string | undefined>(undefined);

  public pieData: Array<number> = [];
  public pieLabels: Array<TierGridValue> = [];
  public pieDimension: TierDimension = 'content-tier';
  public readonly pieFilterValue = signal<TierGridValue | undefined>(undefined);
  public piePercentages: { [key: number]: number } = {};
  public readonly ready = signal<boolean>(false);

  public readonly filterTerm = linkedSignal<{ data: any[]; request: any }, string>({
    source: () => ({
      data: this.gridDataRaw(),
      request: this.recordHighlightRequest()
    }),
    computation: (source) => {
      return source.request ?? '';
    }
  });

  public sortDimension = this.pieDimension;
  public sortDirection: SortDirection = SortDirection.NONE;
  public summaryData!: TierSummaryBase;
  public filteredSummaryData?: TierSummaryBase;

  public readonly maxPageSizes = [10, 25, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  public maxPageSize = this.maxPageSizes[0].value;
  public readonly visibleRowsDefault = 7;

  public readonly onLoadingStatusChange = output<boolean>();
  public readonly onReportLinkClicked = output<string>();

  public readonly pieCanvasEl = viewChild.required<ElementRef<HTMLCanvasElement>>('pieCanvas');
  public readonly scrollableElement = viewChild('scrollableElement', {
    read: IsScrollableDirective
  });
  public readonly pieComponent = viewChild<PieComponent>('pieComponent');
  public readonly paginator = viewChild<GridPaginatorComponent>('paginator');

  public pagerInfo!: PagerInfo;

  /**
   * goToPage
   * Custom grid page leaps via keyboard enter triggers inside the data view paginator.
   */
  public goToPage(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const inputElement = event.target as HTMLInputElement;
      const val = inputElement.value.replace(/\D/g, '');
      if (val.length > 0 && this.pagerInfo) {
        const pageNum = Math.min(this.pagerInfo.pageCount, parseInt(val, 10));
        this.paginator()?.setPage(Math.max(0, pageNum - 1));
      }
      inputElement.value = '';
    }
  }

  constructor() {
    super();

    effect(() => {
      this.gridData();
      const directive = this.scrollableElement();
      if (directive) {
        directive.calc();
      }
    });

    effect(() => {
      this.filterTerm();
      this.gridDataRaw();
      this.pieFilterValue();
      this.recordHighlightRequest();
      this.rebuildGrid();
    });

    effect(() => {
      if (this.isVisible()) {
        const pie = this.pieComponent();
        if (pie?.chart) {
          pie.resizeChart(pie.chart);
        }

        const currentId = this.datasetId();
        if (currentId && currentId !== this.lastLoadedId()) {
          this.loadData();
        }
      }
    });
  }

  /**
   * loadData
   * Dispatches network API actions to retrieve record tier mapping configurations.
   */

  /**
   * loadData
   * Dispatches network API actions to retrieve record tier mapping configurations.
   * Explicit type boundary conversion aligns local string inputs with numeric service parameters.
   */
  public loadData(): void {
    const rawId = this.datasetId();
    const idToLoad = rawId !== undefined && rawId !== null ? `${rawId}`.trim() : '';

    if (!idToLoad || idToLoad === 'undefined' || idToLoad === 'null') {
      this.onLoadingStatusChange.emit(false);
      return;
    }

    this.onLoadingStatusChange.emit(true);

    this.subs.push(
      // 🚀 THE PARAMETER TYPE MATCH FIX:
      // Convert the string ID to a number primitive using Number() right at the service boundary.
      // This fully satisfies SandboxService.getDatasetRecords(number) and fixes the TS2345 compiler crash instantly!
      this.sandbox.getDatasetRecords(Number(idToLoad)).subscribe({
        next: (records: Array<TierSummaryRecord>) => {
          const safeRecords = records || [];
          this.gridDataRaw.set([...safeRecords]);
          this.filterTerm.set('');

          this.fmtDataForChart(safeRecords, this.pieDimension);
          this.setPieFilterValue(this.pieFilterValue());
          this.onLoadingStatusChange.emit(false);
          this.lastLoadedId.set(idToLoad);

          if (safeRecords.length > 0) {
            this.summaryData = getLowestValues(safeRecords);
            this.ready.set(true);
          }

          const currentFilter = this.pieFilterValue();
          if (currentFilter !== undefined && (currentFilter as any) !== 'undefined') {
            queueMicrotask(() => {
              this.changeDetector.markForCheck();

              if (currentFilter) {
                const labelIndex = this.pieLabels.indexOf(currentFilter);
                const pie = this.pieComponent();

                if (pie?.chart && labelIndex !== -1) {
                  pie.setPieSelection(labelIndex, true);
                  pie.chart.update('none');
                }
              }
            });
          }
          this.highlightRecord();
        },
        error: (err: HttpErrorResponse): void => {
          console.error('❌ Failed loading dataset tier values:', err);
          this.onLoadingStatusChange.emit(false);
          this.ready.set(false);
          this.changeDetector.markForCheck();
        }
      })
    );
  }

  /**
   * reportLinkEmit
   * Emits the selected record ID to the parent container unless the Ctrl key is pressed.
   */
  public reportLinkEmit(event: KeyboardEvent, recordId: string): void {
    if (event && !event.ctrlKey) {
      event.preventDefault();
      this.onReportLinkClicked.emit(recordId);
    }
  }

  /**
   * fmtDataForChart
   * Converts raw table responses into aggregated data vectors to power pie charts.
   */
  public fmtDataForChart(records: Array<TierSummaryRecord>, dimension: TierDimension): void {
    const safeRecords = records || [];
    const labels = safeRecords
      .map((row: TierSummaryRecord) => row[dimension] as string)
      .filter((value: string, index: number, self: Array<string>) => self.indexOf(value) === index);

    const data: Array<number> = [];
    labels.forEach((label: string) => {
      let labelTotal = 0;
      safeRecords.forEach((row: TierSummaryRecord) => {
        if (row[dimension] === label) {
          labelTotal += 1;
        }
      });
      data.push(labelTotal);
    });

    const total =
      data.reduce((dataTotal: number, datapoint: number) => dataTotal + datapoint, 0) || 1;

    this.piePercentages = data.reduce((map: { [key: number]: number }, value: number) => {
      const pct = (value / total) * 100;
      map[value] = Math.round(pct);
      return map;
    }, {});

    this.pieDimension = dimension;
    this.pieLabels = labels as Array<TierGridValue>;
    this.pieData = data;
  }

  /**
   * removeAllFilters
   * Resets active filters, clearing text boxes and re-rendering baseline lists.
   */
  public removeAllFilters(): void {
    this.pieComponent()?.setPieSelection(-1, true);
    this.pieFilterValue.set(undefined);
    this.filterTerm.set('');
    this.rebuildGrid();
  }

  /**
   * sortHeaderClick
   * Handles column head grid interactions to shift display sort sequences.
   */
  public sortHeaderClick(sortDimension: TierDimension = 'content-tier'): void {
    if (this.pieDimension === sortDimension && this.pieFilterValue() !== undefined) {
      this.pieComponent()?.setPieSelection(-1, true);
      return;
    }

    const dimensionChanged = this.sortDimension !== sortDimension;
    this.sortDimension = sortDimension;

    if (this.pieFilterValue() === undefined && sortDimension !== 'record-id' && dimensionChanged) {
      this.fmtDataForChart(this.gridDataRaw(), sortDimension);
    }

    if (dimensionChanged) {
      if (sortDimension === 'record-id' && this.sortDirection === SortDirection.NONE) {
        this.sortDirection = SortDirection.ASC;
      }
    } else {
      switch (this.sortDirection) {
        case SortDirection.DESC:
          this.sortDirection = SortDirection.ASC;
          break;
        case SortDirection.NONE:
          this.sortDirection = SortDirection.DESC;
          break;
        case SortDirection.ASC:
          this.sortDirection = SortDirection.NONE;
          break;
      }
    }

    this.gridData.update((currentRecords) => {
      const sortedRecords = [...(currentRecords ?? [])];
      this.sortRows(sortedRecords, sortDimension);
      return sortedRecords;
    });
  }

  /**
   * sortRows
   * Evaluation engine rearranging arrays based on the active SortDirection flag.
   */
  public sortRows(records: Array<TierSummaryRecord>, dimension: TierDimension): void {
    if (!records || !records.length) return;

    records.sort((a: TierSummaryRecord, b: TierSummaryRecord) => {
      const valA = a[dimension];
      const valB = b[dimension];

      if (valA > valB) {
        return this.sortDirection === SortDirection.DESC ? -1 : 1;
      }
      if (valB > valA) {
        return this.sortDirection === SortDirection.DESC ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * setPieFilterValue
   * Updates row filtering parameters based on section clicks from the pie chart.
   */
  public setPieFilterValue(value?: TierGridValue): void {
    this.pieFilterValue.set(value);
    this.rebuildGrid();
  }

  /**
   * rebuildGrid
   * Combines chart slices and text criteria match metrics to rebuild table records.
   */
  public rebuildGrid(): void {
    const rawData = this.gridDataRaw() ?? [];
    if (!rawData.length) {
      this.gridData.set([]);
      this.filteredSummaryData = undefined;
      return;
    }

    let records = [...rawData];
    this.sortRows(records, this.sortDimension);

    const activePieFilter = this.pieFilterValue();
    if (activePieFilter !== undefined) {
      records = records.filter(
        (row: TierSummaryRecord) => row[this.pieDimension] === activePieFilter
      );
    } else {
      this.sortDimension = this.pieDimension;
    }

    const currentSearchTerm = this.filterTerm() || '';
    if (currentSearchTerm.length > 0) {
      const sanitised = sanitiseSearchTerm(currentSearchTerm);

      if (sanitised.length > 0) {
        const searchTargetLower = sanitised.toLowerCase();
        records = records.filter((row: TierSummaryRecord) => {
          const recordId = row['record-id'] ? `${row['record-id']}`.toLowerCase() : '';
          return recordId.includes(searchTargetLower);
        });
      }
    }

    this.gridData.set([...records]);

    if (currentSearchTerm.length > 0 || activePieFilter !== undefined) {
      const activeGridData = this.gridData();
      this.filteredSummaryData =
        activeGridData.length > 0 ? getLowestValues(activeGridData) : undefined;
    } else {
      this.filteredSummaryData = undefined;
    }

    this.changeDetector.markForCheck();
  }

  /**
   * updateTerm
   * Listens to the search box keystrokes to synchronize active data filters.
   */
  public updateTerm(e: KeyboardEvent): void {
    if (!e?.target) return;

    const value = (e.target as HTMLInputElement).value;
    this.filterTerm.set(value);

    if (e.key?.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.rebuildGrid();
    }
  }

  public contentTierChildActive(): boolean {
    const children = ['license', 'content-tier'];
    return children.includes(this.pieDimension);
  }

  public metadataChildActive(): boolean {
    const children: Array<TierDimension> = [
      'metadata-tier-language',
      'metadata-tier-enabling-elements',
      'metadata-tier-contextual-classes'
    ];
    return children.includes(this.pieDimension);
  }

  public setPagerInfo(info: PagerInfo): void {
    if (info) {
      this.pagerInfo = info;
      this.changeDetector.markForCheck();
    }
  }

  public highlightRecord(): void {
    const highlightTarget = this.recordHighlightRequest() ?? '';
    this.filterTerm.set(highlightTarget);
    this.rebuildGrid();
  }
}
