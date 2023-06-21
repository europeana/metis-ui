import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SandboxService } from '../_services';
import {
  DatasetTierSummary,
  DatasetTierSummaryRecord,
  LicenseType,
  PagerInfo,
  SortDirection,
  TierDimension,
  TierGridValue
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { sanitiseSearchTerm } from '../_helpers';
import { PieComponent } from '../chart/pie/pie.component';
import { GridPaginatorComponent } from '../grid-paginator';

@Component({
  selector: 'sb-dataset-content-summary',
  templateUrl: './dataset-content-summary.component.html',
  styleUrls: ['./dataset-content-summary.component.scss']
})
export class DatasetContentSummaryComponent extends SubscriptionManager {
  public LicenseType = LicenseType;
  public SortDirection = SortDirection;
  gridData: Array<DatasetTierSummaryRecord> = [];
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
  summaryData: DatasetTierSummary;
  _isVisible = false;

  maxPageSizes = [10, 25, 50].map((option: number) => {
    return { title: `${option}`, value: option };
  });
  maxPageSize = this.maxPageSizes[0].value;

  @Input() datasetId: number;

  @Input() set isVisible(isVisible: boolean) {
    this._isVisible = isVisible;
    if (isVisible) {
      if (this.datasetId !== this.lastLoadedId) {
        this.loadData();
      }
    }
  }
  get isVisible(): boolean {
    return this._isVisible;
  }

  @Output() onLoadingStatusChange = new EventEmitter<boolean>();

  @ViewChild('pieCanvas') pieCanvasEl: ElementRef;
  @ViewChild(PieComponent, { static: false }) pieComponent: PieComponent;

  @ViewChild('paginator', { static: true }) paginator: GridPaginatorComponent;

  pagerInfo: PagerInfo;

  constructor(public readonly sandbox: SandboxService) {
    super();
  }

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
      this.sandbox.getDatasetTierSummary(idToLoad).subscribe((summary: DatasetTierSummary) => {
        this.summaryData = summary;
        this.filterTerm = '';
        this.fmtDataForChart(this.summaryData.records, this.pieDimension);
        this.setPieFilterValue(this.pieFilterValue);
        this.onLoadingStatusChange.emit(false);
        this.lastLoadedId = idToLoad;
        if (summary.records.length > 0) {
          this.ready = true;
        }
        if (this.pieFilterValue) {
          setTimeout(() => {
            this.pieComponent.setPieSelection(this.pieLabels.indexOf(this.pieFilterValue));
            this.pieComponent.chart.update();
          }, 0);
        }
      })
    );
  }

  /**
   * fmtDataForChart
   * converts record data into dimension-summarised data (pieData / pieLabels)
   * assigns values to globals pieData, pieDimension and pieLabels
   * @param { Array<DatasetTierSummaryRecord> } records - the data
   * @param { TierDimension } dimension - the dimension to represent
   **/
  fmtDataForChart(records: Array<DatasetTierSummaryRecord>, dimension: TierDimension): void {
    const labels = records
      .map((row: DatasetTierSummaryRecord) => {
        return row[dimension] as string;
      })
      .filter((value: string, index: number, self: Array<string>) => {
        return self.indexOf(value) === index;
      });

    const data: Array<number> = [];
    labels.forEach((label: string) => {
      let labelTotal = 0;
      records.forEach((row: DatasetTierSummaryRecord) => {
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
   * sortHeaderClick
   * handles click on grid header by sorting and optionally updating the pie chart
   * @param { string } dimension - the dimension to represent
   * @param { boolean } toggleSort - flag to update sort direction
   **/
  sortHeaderClick(sortDimension: TierDimension = 'content-tier', toggleSort = true): void {
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
      this.fmtDataForChart(this.summaryData.records, sortDimension);
    }

    // shift toggle state
    if (toggleSort) {
      // don't toggle if it would remove sort while switching to record-id
      if (dimensionChanged) {
        if (sortDimension === 'record-id' && this.sortDirection === SortDirection.NONE) {
          this.sortDirection = SortDirection.ASC;
        }
      } else {
        if (this.sortDirection === SortDirection.DESC) {
          this.sortDirection = SortDirection.ASC;
        } else if (this.sortDirection === SortDirection.NONE) {
          this.sortDirection = SortDirection.DESC;
        } else if (this.sortDirection === SortDirection.ASC) {
          this.sortDirection = SortDirection.NONE;
        }
      }
    }
    this.sortRows(records, sortDimension);
    this.gridData = records;
  }

  /**
   * sortRows
   * @param { Array<DatasetTierSummaryRecord> } records
   * @param { TierDimension } dimension
   **/
  sortRows(records: Array<DatasetTierSummaryRecord>, dimension: TierDimension): void {
    records.sort((a: DatasetTierSummaryRecord, b: DatasetTierSummaryRecord) => {
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
    let records = structuredClone(this.summaryData.records);
    this.sortRows(records, this.sortDimension);

    if (this.pieFilterValue !== undefined) {
      records = records.filter((row: DatasetTierSummaryRecord) => {
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
        records = records.filter((row: DatasetTierSummaryRecord) => {
          const result = !!reg.exec(row['record-id']);
          reg.lastIndex = 0;
          return result;
        });
      }
    }
    this.gridData = records;
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
    const children = ['metadata-tier-language', 'metadata-tier-elements', 'metadata-tier-classes'];
    return children.includes(this.pieDimension);
  }

  setPagerInfo(info: PagerInfo): void {
    setTimeout(() => {
      this.pagerInfo = info;
    }, 0);
  }
}
