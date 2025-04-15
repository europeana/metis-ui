import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
  private readonly changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);

  public LicenseType = LicenseType;
  public SortDirection = SortDirection;

  gridData: Array<TierSummaryRecord> = [];
  gridDataRaw: Array<TierSummaryRecord> = [];
  lastLoadedId: number;
  pieData: Array<number> = [];
  pieLabels: Array<TierGridValue> = [];
  pieDimension: TierDimension = 'content-tier';
  pieFilterValue?: TierGridValue;
  piePercentages: { [key: number]: number } = {};
  ready = false;
  filterTerm = '';
  sortDimension = this.pieDimension;
  sortDirection: SortDirection = SortDirection.NONE;
  summaryData: TierSummaryBase;
  filteredSummaryData?: TierSummaryBase;
  _isVisible = false;

  maxPageSizes = [10, 25, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  maxPageSize = this.maxPageSizes[0].value;
  visibleRowsDefault = 7;

  @Input() datasetId: number;

  @Input() set isVisible(isVisible: boolean) {
    this._isVisible = isVisible;
    if (isVisible) {
      if (this.pieComponent) {
        this.pieComponent.resizeChart(this.pieComponent.chart);
      }
      if (this.datasetId !== this.lastLoadedId) {
        this.loadData();
      }
    }
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  @Output() onLoadingStatusChange = new EventEmitter<boolean>();
  @Output() onReportLinkClicked = new EventEmitter<string>();

  @ViewChild('pieCanvasEl') pieCanvasEl: ElementRef;

  @ViewChild(IsScrollableDirective) scrollableElement: IsScrollableDirective;
  @ViewChild(PieComponent, { static: false }) pieComponent: PieComponent;
  @ViewChild('paginator') paginator: GridPaginatorComponent;

  pagerInfo: PagerInfo;

  /** goToPage
  /* @param { KeyboardEvent } event
  **/
  goToPage(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const input = event.target as HTMLInputElement;
      const val = input.value.replace(/\D/g, '');
      if (val.length > 0) {
        const pageNum = Math.min(this.pagerInfo.pageCount, parseInt(val));
        this.paginator.setPage(Math.max(0, pageNum - 1));
      }
      input.value = '';
    }
  }

  /**
   * loadData
   * loads data and initialises grid and chart
   **/
  loadData(): void {
    const idToLoad = this.datasetId;
    this.onLoadingStatusChange.emit(true);

    this.subs.push(
      this.sandbox.getDatasetRecords(idToLoad).subscribe((records: Array<TierSummaryRecord>) => {
        this.gridDataRaw = records;
        this.filterTerm = '';
        this.fmtDataForChart(records, this.pieDimension);
        this.setPieFilterValue(this.pieFilterValue);
        this.onLoadingStatusChange.emit(false);
        this.lastLoadedId = idToLoad;
        if (records.length > 0) {
          this.summaryData = getLowestValues(records);
          this.ready = true;
        }
        if (this.pieFilterValue !== 'undefined') {
          if (!this.pieComponent) {
            this.changeDetector.markForCheck();
            this.changeDetector.detectChanges();
          }
          this.pieComponent.setPieSelection(this.pieLabels.indexOf(this.pieFilterValue));
          this.pieComponent.chart.update();
        }
      })
    );
  }

  /**
   * reportLinkEmit
   * Calls emit on this.reportLinkEmit, unless the ctrl key is held
   * @param { KeyboardEvent } event - nullable event
   * @param { string } recordId - the recordId to emit
   **/
  reportLinkEmit(event: KeyboardEvent, recordId: string): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.onReportLinkClicked.emit(recordId);
    }
  }

  /**
   * fmtDataForChart
   * converts record data into dimension-summarised data (pieData / pieLabels)
   * assigns values to globals pieData, pieDimension and pieLabels
   * @param { Array<TierSummaryRecord> } records - the data
   * @param { TierDimension } dimension - the dimension to represent
   **/
  fmtDataForChart(records: Array<TierSummaryRecord>, dimension: TierDimension): void {
    const labels = records
      .map((row: TierSummaryRecord) => {
        return row[dimension] as string;
      })
      .filter((value: string, index: number, self: Array<string>) => {
        return self.indexOf(value) === index;
      });

    const data: Array<number> = [];
    labels.forEach((label: string) => {
      let labelTotal = 0;
      records.forEach((row: TierSummaryRecord) => {
        if (row[dimension] === label) {
          labelTotal += 1;
        }
      });
      data.push(labelTotal);
    });

    const total = data.reduce((dataTotal: number, datapoint: number) => {
      return dataTotal + datapoint;
    }, 0);

    this.piePercentages = data.reduce((map: { [key: number]: number }, value: number) => {
      const pct = (value / total) * 100;
      map[value] = parseInt(pct.toFixed(0));
      return map;
    }, {});

    this.pieDimension = dimension;
    this.pieLabels = labels;
    this.pieData = data;
  }

  /**
   * removeAllFilters
   * resets the pie selection and pieFilter and filterTerm variables, rebuilds grid
   **/
  removeAllFilters(): void {
    this.pieComponent.setPieSelection(-1, true);
    this.pieFilterValue = undefined;
    this.filterTerm = '';
    this.rebuildGrid();
  }

  /**
   * sortHeaderClick
   * handles click on grid header by sorting and optionally updating the pie chart
   * @param { string } dimension - the dimension to represent
   * @param { boolean } toggleSort - flag to update sort direction
   **/
  sortHeaderClick(sortDimension: TierDimension = 'content-tier'): void {
    // if we're filtering and sorting on that dimension remove the filter and exit
    if (this.pieDimension === sortDimension && this.pieFilterValue !== undefined) {
      this.pieComponent.setPieSelection(-1, true);
      return;
    }

    const dimensionChanged = this.sortDimension !== sortDimension;
    const records = structuredClone(this.gridData);
    this.sortDimension = sortDimension;

    // pie data is never filtered and dimension updated only if changed
    if (this.pieFilterValue === undefined && sortDimension !== 'record-id' && dimensionChanged) {
      this.fmtDataForChart(this.gridDataRaw, sortDimension);
    }

    // shift toggle state
    // don't toggle if it would remove sort while switching to record-id
    if (dimensionChanged) {
      if (sortDimension === 'record-id' && this.sortDirection === SortDirection.NONE) {
        this.sortDirection = SortDirection.ASC;
      }
    } else if (this.sortDirection === SortDirection.DESC) {
      this.sortDirection = SortDirection.ASC;
    } else if (this.sortDirection === SortDirection.NONE) {
      this.sortDirection = SortDirection.DESC;
    } else if (this.sortDirection === SortDirection.ASC) {
      this.sortDirection = SortDirection.NONE;
    }

    this.sortRows(records, sortDimension);
    this.gridData = records;
  }

  /**
   * sortRows
   * @param { Array<TierSummaryRecord> } records
   * @param { TierDimension } dimension
   **/
  sortRows(records: Array<TierSummaryRecord>, dimension: TierDimension): void {
    records.sort((a: TierSummaryRecord, b: TierSummaryRecord) => {
      if (a[dimension] > b[dimension]) {
        if (this.sortDirection === SortDirection.DESC) {
          return -1;
        } else if (this.sortDirection === SortDirection.ASC) {
          return 1;
        }
      } else if (b[dimension] > a[dimension]) {
        if (this.sortDirection === SortDirection.DESC) {
          return 1;
        } else if (this.sortDirection === SortDirection.ASC) {
          return -1;
        }
      }
      return 0;
    });
  }

  /**
   * setPieFilterValue
   * Updates rows according to filter
   * @param { TierGridValue } value
   **/
  setPieFilterValue(value?: TierGridValue): void {
    this.pieFilterValue = value;
    this.rebuildGrid();
  }

  /**
   * rebuildGrid
   * Updates rows (re-clones), filters and sorts
   * resets sortDimension to pieDimension;
   **/
  rebuildGrid(): void {
    let records = structuredClone(this.gridDataRaw);
    this.sortRows(records, this.sortDimension);

    if (this.pieFilterValue !== undefined) {
      records = records.filter((row: TierSummaryRecord) => {
        return row[this.pieDimension] === this.pieFilterValue;
      });
    } else {
      // there is no pie filter so remove any sub-sort
      this.sortDimension = this.pieDimension;
    }

    if (this.filterTerm.length > 0) {
      const sanitised = sanitiseSearchTerm(this.filterTerm);
      if (sanitised.length > 0) {
        const reg = new RegExp(sanitised, 'gi');
        records = records.filter((row: TierSummaryRecord) => {
          const result = !!reg.exec(row['record-id']);
          reg.lastIndex = 0;
          return result;
        });
      }
    }
    this.gridData = records;

    // Update filter summary row data
    if (this.filterTerm.length > 0 || this.pieFilterValue !== undefined) {
      if (this.gridData.length > 0) {
        this.filteredSummaryData = getLowestValues(this.gridData);
      } else {
        this.filteredSummaryData = undefined;
      }
    } else {
      this.filteredSummaryData = undefined;
    }

    if (this.scrollableElement) {
      this.changeDetector.detectChanges();
      this.scrollableElement.calc();
    }
  }

  /** updateTerm
  /* @param { KeyboardEvent } e
  **/
  updateTerm(e: KeyboardEvent): void {
    if (e.key.length === 1 || ['Backspace', 'Delete'].includes(e.key)) {
      this.rebuildGrid();
    }
  }

  /**
   * contentTierChildActive
   * @returns boolean
   **/
  contentTierChildActive(): boolean {
    const children = ['license', 'content-tier'];
    return children.includes(this.pieDimension);
  }

  /**
   * metadataChildActive
   * @returns boolean
   **/
  metadataChildActive(): boolean {
    const children: Array<TierDimension> = [
      'metadata-tier-language',
      'metadata-tier-enabling-elements',
      'metadata-tier-contextual-classes'
    ];
    return children.includes(this.pieDimension);
  }

  setPagerInfo(info: PagerInfo): void {
    this.pagerInfo = info;
  }
}
