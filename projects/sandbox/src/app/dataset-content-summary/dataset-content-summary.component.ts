import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SandboxService } from '../_services';
import { ContentSummaryRow, DatasetTierSummary } from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager } from 'shared';

interface IHashNumeric {
  [key: number]: string;
}

interface IHashValue {
  [key: string]: string | number;
}

@Component({
  selector: 'sb-dataset-content-summary',
  templateUrl: './dataset-content-summary.component.html',
  styleUrls: ['./dataset-content-summary.component.scss']
})
export class DatasetContentSummaryComponent extends SubscriptionManager {
  @ViewChild('pieCanvas') pieCanvasEl: ElementRef;

  pieLabels: Array<string> = [];
  pieData: Array<number> = [];
  piePercentages: { [key: number]: string } = {};
  pieDimension = 'content-tier';
  sortDimension = 'content-tier';
  sortDirection: -1 | 0 | 1 = 0;
  ready = false;
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

  summaryData: DatasetTierSummary;
  gridData: Array<ContentSummaryRow> = [];

  constructor(public readonly sandbox: SandboxService) {
    super();
  }

  loadData(): void {
    this.subs.push(
      this.sandbox.getDatasetTierSummary().subscribe((summary: DatasetTierSummary) => {
        this.summaryData = summary;
        this.sortHeaderClick(this.sortDimension, false);
        this.ready = true;
      })
    );
  }

  /**
   * fmtDataForChart
   * converts grid data into dimension summary data (pieData / pieLabels)
   * @param { Array<ContentSummaryRow> } records - the data
   * @param { string } dimension - the dimension to represent
   **/
  fmtDataForChart(records: Array<ContentSummaryRow>, dimension: string): void {
    const labels = records
      .map((row: ContentSummaryRow) => {
        const rowX = (row as unknown) as IHashValue;
        return rowX[dimension] as string;
      })
      .filter((value: string, index: number, self: Array<string>) => {
        return self.indexOf(value) === index;
      });

    const data: Array<number> = [];
    labels.forEach((label: string) => {
      let labelTotal = 0;
      records.forEach((row: ContentSummaryRow) => {
        const rowX = (row as unknown) as IHashValue;
        if (rowX[dimension] === label) {
          labelTotal += 1;
        }
      });
      data.push(labelTotal);
    });

    const total = data.reduce((total: number, datapoint: number) => {
      return total + datapoint;
    }, 0);
    this.piePercentages = data.reduce((map: IHashNumeric, value: number) => {
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
  sortHeaderClick(dimension = 'content-tier', toggleSort = true): void {
    const dimensionChanged = this.sortDimension !== dimension;
    const records = structuredClone(this.summaryData.records);

    // only update pie chart if dimension changed or if initialising
    if (dimension !== 'record-id' && (dimensionChanged || !this.ready)) {
      this.fmtDataForChart(records, dimension);
    }

    this.sortDimension = dimension;

    // sort record data
    if (toggleSort) {
      if (dimensionChanged && !(dimension === 'record-id' && this.sortDirection === 0)) {
        this.sortDirection === 1;
      } else {
        if (this.sortDirection === -1) {
          this.sortDirection = 1;
        } else if (this.sortDirection === 0) {
          this.sortDirection = -1;
        } else if (this.sortDirection === 1) {
          this.sortDirection = 0;
        }
      }
    }

    records.sort((a: IHashValue, b: IHashValue) => {
      if (a[dimension] > b[dimension]) {
        if (this.sortDirection === -1) {
          return -1;
        } else if (this.sortDirection === 1) {
          return 1;
        }
      } else if (b[dimension] > a[dimension]) {
        if (this.sortDirection === -1) {
          return 1;
        } else if (this.sortDirection === 1) {
          return -1;
        }
      }
      return 0;
    });
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
