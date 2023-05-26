import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ContentSummaryRow } from '../_models';

// DATA
const responseData = {
  license: 'CC1',
  'content-tier': 1,
  'metadata-tier-average': 'B',
  'metadata-tier-language': 'A',
  'metadata-tier-elements': 'C',
  'metadata-tier-classes': 'B',
  records: [
    {
      'record-id': '/123/GHSDF_AB_the_collected_works_of_nobody',
      license: 'CC1',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/123/GHSDF_CD_the_collected_works_of_nobody_in_particular',
      license: 'CC0',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/321/SDFGH_DC_collected_works',
      license: 'CC-BY',
      'content-tier': 4,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/201/XCVBN_EF_the_collected_works_of_nobody',
      license: 'CC0',
      'content-tier': 2,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'In Copyright',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/375/XCVBN_GH_the_collected_works_of_nobody',
      license: 'CC0',
      'content-tier': 1,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      license: 'CC-BY-SA',
      'content-tier': 1,
      'metadata-tier-average': 'A',
      'metadata-tier-language': 'B',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/324/UVBNMJ_GH_the_collected_anthology',
      license: 'CC-BY-SA-NC',
      'content-tier': 0,
      'metadata-tier-average': 'D',
      'metadata-tier-language': 'D',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'D'
    },
    {
      'record-id': '/322/UVVBN_EF_the_collected_works',
      license: 'In Copyright',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'C'
    },
    {
      'record-id': '/321/UVXXXX_HJ_the_collected_anthology',
      license: 'CC-BY',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'B'
    }
  ]
};

// COMPONENT
@Component({
  selector: 'sb-dataset-content-summary',
  templateUrl: './dataset-content-summary.component.html',
  styleUrls: ['./dataset-content-summary.component.scss']
})
export class DatasetContentSummaryComponent {
  @ViewChild('pieCanvas') pieCanvasEl: ElementRef;

  pieDimension = 'content-tier';
  pieLabels: Array<string> = [];
  pieData: Array<number> = [];

  ready = false;
  _isVisible = false;

  @Input() set isVisible(isVisible: boolean) {
    if (isVisible && !this.ready) {
      this.fmtDataForChart();
      this.ready = true;
    }
    this._isVisible = isVisible;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  summaryData = responseData;
  gridData = responseData.records as Array<ContentSummaryRow>;

  /**
   * fmtDataForChart
   * converts grid data into dimension summary data (pieData / pieLabels)
   * @param { string } dimension - the dimension to represent
   **/
  fmtDataForChart(dimension = 'content-tier'): void {
    const data: Array<number> = [];
    const labels = this.gridData
      .map((row: ContentSummaryRow) => {
        const rowX = (row as unknown) as { [key: string]: string | number };
        return rowX[dimension] as string;
      })
      .filter((value: string, index: number, self: Array<string>) => {
        return self.indexOf(value) === index;
      });

    labels.forEach((label: string) => {
      let labelTotal = 0;
      this.gridData.forEach((row: ContentSummaryRow) => {
        const rowX = (row as unknown) as { [key: string]: string | number };
        if (rowX[dimension] === label) {
          labelTotal += 1;
        }
      });
      data.push(labelTotal);
    });
    this.pieLabels = labels;
    this.pieData = data;
    this.pieDimension = dimension;
  }
}
