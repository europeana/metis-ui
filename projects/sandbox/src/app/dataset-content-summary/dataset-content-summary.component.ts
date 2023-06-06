import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SandboxService } from '../_services';
import {
  ContentSummaryRow,
  DatasetTierSummary,
  SortDirection,
  TierDimension,
  TierGridValue
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';
import { PieComponent } from '../chart/pie/pie.component';

@Component({
  selector: 'sb-dataset-content-summary',
  templateUrl: './dataset-content-summary.component.html',
  styleUrls: ['./dataset-content-summary.component.scss']
})
export class DatasetContentSummaryComponent extends SubscriptionManager {
  public SortDirection = SortDirection;
  gridData: Array<ContentSummaryRow> = [];
  pieData: Array<number> = [];
  pieLabels: Array<TierGridValue> = [];
  pieDimension: TierDimension = 'content-tier';
  pieFilterValue?: TierGridValue;

  piePercentages: { [key: number]: string } = {};
  ready = false;
  sortDimension = this.pieDimension;
  sortDirection: SortDirection = SortDirection.NONE;
  summaryData: DatasetTierSummary;

  _isVisible = false;

  @Input() set isVisible(isVisible: boolean) {
    this._isVisible = isVisible;
    if (isVisible) {
      this.loadData();
    }
  }
  get isVisible(): boolean {
    return this._isVisible;
  }

  @ViewChild('pieCanvas') pieCanvasEl: ElementRef;
  @ViewChild(PieComponent, { static: false }) pieComponent: PieComponent;

  constructor(public readonly sandbox: SandboxService) {
    super();
  }

  /**
   * loadData
   * loads data and initialises grid and chart
   **/
  loadData(): void {
    this.subs.push(
      this.sandbox.getDatasetTierSummary().subscribe((summary: DatasetTierSummary) => {
        this.summaryData = summary;
        this.fmtDataForChart(this.summaryData.records, this.pieDimension);
        this.setPieFilterValue(this.pieFilterValue);
        this.ready = true;
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
   * @param { Array<ContentSummaryRow> } records - the data
   * @param { TierDimension } dimension - the dimension to represent
   **/
  fmtDataForChart(records: Array<ContentSummaryRow>, dimension: TierDimension): void {
    const labels = records
      .map((row: ContentSummaryRow) => {
        return row[dimension] as string;
      })
      .filter((value: string, index: number, self: Array<string>) => {
        return self.indexOf(value) === index;
      });

    const data: Array<number> = [];
    labels.forEach((label: string) => {
      let labelTotal = 0;
      records.forEach((row: ContentSummaryRow) => {
        if (row[dimension] === label) {
          labelTotal += 1;
        }
      });
      data.push(labelTotal);
    });

    const total = data.reduce((total: number, datapoint: number) => {
      return total + datapoint;
    }, 0);
    this.piePercentages = data.reduce((map: { [key: number]: string }, value: number) => {
      const pct = (value / total) * 100;
      map[value] = `${pct.toFixed(0)}%`;
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
      this.setPieFilterValue(undefined);
      this.pieComponent.setPieSelection(-1);
      this.pieComponent.chart.update();
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
      if (
        dimensionChanged &&
        !(sortDimension === 'record-id' && this.sortDirection === SortDirection.NONE)
      ) {
        this.sortDirection === SortDirection.ASC;
      } else {
        if (this.sortDirection === SortDirection.DESC) {
          this.sortDirection = SortDirection.ASC;
        } else if (this.sortDirection === SortDirection.NONE) {
          this.sortDirection = SortDirection.DESC;
        } else if (this.sortDirection === 1) {
          this.sortDirection = SortDirection.NONE;
        }
      }
    }
    this.gridData = records;
    this.sortRows(records, sortDimension);
  }

  /**
   * sortRows
   * @param { Array<ContentSummaryRow> } records
   * @param { TierDimension } dimension
   **/
  sortRows(records: Array<ContentSummaryRow>, dimension: TierDimension): void {
    records.sort((a: ContentSummaryRow, b: ContentSummaryRow) => {
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
    let records = structuredClone(this.summaryData.records);
    this.sortRows(records, this.sortDimension);

    if (this.pieFilterValue !== undefined) {
      records = records.filter((row: ContentSummaryRow) => {
        return row[this.pieDimension] === this.pieFilterValue;
      });
    } else {
      // remove any sub-sort
      this.sortDimension = this.pieDimension;
    }
    this.gridData = records;
  }

  /**
   * metadataChildActive
   * @returns boolean
   **/
  metadataChildActive(): boolean {
    const children = ['metadata-tier-language', 'metadata-tier-elements', 'metadata-tier-classes'];
    return children.includes(this.pieDimension);
  }
}
