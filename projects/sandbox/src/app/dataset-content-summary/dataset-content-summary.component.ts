import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
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
    NgClass,
    PieComponent,
    NgTemplateOutlet,
    FormsModule,
    GridPaginatorComponent,
    FormatLicensePipe,
    FormatTierDimensionPipe,
    HighlightMatchPipe,
    IsScrollableDirective
  ]
})
export class DatasetContentSummaryComponent extends SubscriptionManager {
  private readonly sandbox = inject(SandboxService);

  public readonly LicenseType = LicenseType;
  public readonly SortDirection = SortDirection;

  public readonly datasetId = input.required<string>();
  public readonly isVisible = input<boolean>(false);
  public readonly recordHighlightRequest = input<string | undefined>();

  public readonly gridData = signal<Array<TierSummaryRecord>>([]);
  public readonly gridDataRaw = signal<Array<TierSummaryRecord>>([]);
  public readonly lastLoadedId = signal<string | undefined>(undefined);
  public readonly hasError = signal<boolean>(false);

  public readonly pieData = signal<Array<number>>([]);
  public readonly pieLabels = signal<Array<TierGridValue>>([]);
  public readonly pieDimension = signal<TierDimension>('content-tier');
  public readonly piePercentages = signal<{ [key: number]: number }>({});
  public readonly pieFilterValue = signal<TierGridValue | undefined>(undefined);
  public readonly ready = signal<boolean>(false);

  public readonly filterTerm = linkedSignal<
    { data: TierSummaryRecord[]; request: string | undefined },
    string
  >({
    source: () => ({
      data: this.gridDataRaw(),
      request: this.recordHighlightRequest()
    }),
    computation: (source) => source.request ?? ''
  });

  public sortDimension = signal<TierDimension>('content-tier');
  public sortDirection = signal<SortDirection>(SortDirection.NONE);

  public readonly summaryData = computed<TierSummaryBase | undefined>(() => {
    const records = this.gridDataRaw();
    return records.length > 0 ? getLowestValues(records) : undefined;
  });

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
        const currentId = this.datasetId();
        if (currentId && currentId !== this.lastLoadedId()) {
          this.loadData();
        }
      }
    });
  }

  public loadData(): void {
    const rawId = this.datasetId();
    const idToLoad = rawId !== undefined && rawId !== null ? `${rawId}`.trim() : '';

    if (!idToLoad || idToLoad === 'undefined' || idToLoad === 'null') {
      this.onLoadingStatusChange.emit(false);
      return;
    }

    this.onLoadingStatusChange.emit(true);
    this.hasError.set(false);

    this.subs.push(
      this.sandbox.getDatasetRecords(Number(idToLoad)).subscribe({
        next: (records: Array<TierSummaryRecord>) => {
          const safeRecords = records || [];
          this.gridDataRaw.set([...safeRecords]);

          if (idToLoad !== this.lastLoadedId()) {
            this.filterTerm.set('');
          }

          this.fmtDataForChart(safeRecords, this.pieDimension());
          this.setPieFilterValue(this.pieFilterValue());
          this.onLoadingStatusChange.emit(false);
          this.lastLoadedId.set(idToLoad);

          if (safeRecords.length > 0) {
            this.ready.set(true);
            this.hasError.set(false);
          } else {
            this.ready.set(false);
            this.hasError.set(true);
          }

          const currentFilter = this.pieFilterValue();
          if (currentFilter !== undefined && (currentFilter as string) !== 'undefined') {
            const labelIndex = this.pieLabels().indexOf(currentFilter);
            const pie = this.pieComponent();
            if (pie?.chart && labelIndex !== -1) {
              pie.setPieSelection(labelIndex, true);
              pie.chart.update('none');
            }
          }
          this.highlightRecord();
        },
        error: (err: HttpErrorResponse) => {
          console.error('❌ Failed loading dataset tier values:', err);
          this.onLoadingStatusChange.emit(false);
          this.ready.set(false);
          this.hasError.set(true);
        }
      })
    );
  }

  public reportLinkEmit(event: KeyboardEvent, recordId: string): void {
    if (event && !event.ctrlKey) {
      event.preventDefault();
      this.onReportLinkClicked.emit(recordId);
    }
  }

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

    const percentageMap = data.reduce((map: { [key: number]: number }, value: number) => {
      const pct = (value / total) * 100;
      map[value] = Math.round(pct);
      return map;
    }, {});

    this.piePercentages.set(percentageMap);
    this.pieDimension.set(dimension);
    this.pieLabels.set(labels as Array<TierGridValue>);
    this.pieData.set(data);
  }

  public removeAllFilters(): void {
    this.pieComponent()?.setPieSelection(-1, true);
    this.pieFilterValue.set(undefined);
    this.filterTerm.set('');
    this.rebuildGrid();
  }

  public sortHeaderClick(sortDimension: TierDimension = 'content-tier'): void {
    if (this.pieDimension() === sortDimension && this.pieFilterValue() !== undefined) {
      this.pieComponent()?.setPieSelection(-1, true);
      return;
    }

    const dimensionChanged = this.sortDimension() !== sortDimension;
    this.sortDimension.set(sortDimension);

    if (this.pieFilterValue() === undefined && sortDimension !== 'record-id' && dimensionChanged) {
      this.fmtDataForChart(this.gridDataRaw(), sortDimension);
    }

    if (dimensionChanged) {
      if (sortDimension === 'record-id' && this.sortDirection() === SortDirection.NONE) {
        this.sortDirection.set(SortDirection.ASC);
      }
    } else {
      switch (this.sortDirection()) {
        case SortDirection.DESC:
          this.sortDirection.set(SortDirection.ASC);
          break;
        case SortDirection.NONE:
          this.sortDirection.set(SortDirection.DESC);
          break;
        case SortDirection.ASC:
          this.sortDirection.set(SortDirection.NONE);
          break;
      }
    }

    this.gridData.update((currentRecords) => {
      const sortedRecords = [...(currentRecords ?? [])];
      this.sortRows(sortedRecords, sortDimension);
      return sortedRecords;
    });
  }

  public sortRows(records: Array<TierSummaryRecord>, dimension: TierDimension): void {
    if (!records?.length) {
      return;
    }

    records.sort((a: TierSummaryRecord, b: TierSummaryRecord) => {
      const valA = a[dimension];
      const valB = b[dimension];

      if (valA > valB) {
        return this.sortDirection() === SortDirection.DESC ? -1 : 1;
      }
      if (valB > valA) {
        return this.sortDirection() === SortDirection.DESC ? 1 : -1;
      }
      return 0;
    });
  }

  public setPieFilterValue(value?: TierGridValue): void {
    this.pieFilterValue.set(value);
    this.rebuildGrid();
  }

  public rebuildGrid(): void {
    // 1. Safe layout initialization without complex structural deep cloning
    let records = [...this.gridDataRaw()];
    this.sortRows(records, this.sortDimension());

    const currentDim = this.pieDimension();

    // 2. Filter by active pie chart selection
    if (this.pieFilterValue() !== undefined) {
      records = records.filter((row: TierSummaryRecord) => {
        return row[currentDim] === this.pieFilterValue();
      });
    } else {
      this.sortDimension.set(currentDim);
    }

    // 3. MINIMAL FIX: Replace broken RegExp allocation loops with native inclusive string matches
    const term = this.filterTerm();
    if (term && term.length > 0) {
      const sanitised = sanitiseSearchTerm(term).toLowerCase();

      if (sanitised.length > 0) {
        records = records.filter((row: TierSummaryRecord) => {
          return String(row['record-id'])
            .toLowerCase()
            .includes(sanitised);
        });
      }
    }

    // 4. Clean sync update
    this.gridData.set(records);

    if ((term && term.length > 0) || this.pieFilterValue() !== undefined) {
      this.filteredSummaryData = records.length > 0 ? getLowestValues(records) : undefined;
    } else {
      this.filteredSummaryData = undefined;
    }
  }

  public updateTerm(e: KeyboardEvent): void {
    if (!e?.target) return;

    const value = (e.target as HTMLInputElement).value;
    this.filterTerm.set(value);

    if (e.key?.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.rebuildGrid();
    }
  }

  public readonly contentTierChildActive = computed(() => {
    const children: Array<TierDimension> = ['license', 'content-tier'];
    return children.includes(this.pieDimension());
  });

  public readonly metadataChildActive = computed(() => {
    const children: Array<TierDimension> = [
      'metadata-tier-language',
      'metadata-tier-enabling-elements',
      'metadata-tier-contextual-classes'
    ];
    return children.includes(this.pieDimension());
  });

  public setPagerInfo(info: PagerInfo): void {
    if (info) {
      this.pagerInfo = info;
    }
  }

  public highlightRecord(): void {
    const highlightTarget = this.recordHighlightRequest() ?? '';
    this.filterTerm.set(highlightTarget);
    this.rebuildGrid();
  }
}
