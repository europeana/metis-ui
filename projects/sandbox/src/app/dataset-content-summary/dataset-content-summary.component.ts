import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// TYPES
type MetadataTierValue = 'A' | 'B' | 'C' | 'D';
type ContentTierValue = 0 | 1 | 2 | 3 | 4;

interface DatasetContentInfo {
  rights: string;
  'content-tier': ContentTierValue;
  'metadata-tier-average': MetadataTierValue;
  'metadata-tier-language': MetadataTierValue;
  'metadata-tier-elements': MetadataTierValue;
  'metadata-tier-classes': MetadataTierValue;
}

interface ContentSummaryRow extends DatasetContentInfo {
  'record-id': string;
}

// DATA
const responseData = {
  rights: 'CC1',
  'content-tier': 1,
  'metadata-tier-average': 'B',
  'metadata-tier-language': 'A',
  'metadata-tier-elements': 'C',
  'metadata-tier-classes': 'B',
  records: [
    {
      'record-id': '/123/GHSDF_AB_the_collected_works_of_nobody',
      rights: 'CC1',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/123/GHSDF_CD_the_collected_works_of_nobody_in_particular',
      rights: 'CC0',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/321/SDFGH_DC_collected_works',
      rights: 'CC-BY',
      'content-tier': 4,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'A',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/201/XCVBN_EF_the_collected_works_of_nobody',
      rights: 'CC0',
      'content-tier': 2,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      rights: 'In Copyright',
      'content-tier': 1,
      'metadata-tier-average': 'B',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/375/XCVBN_GH_the_collected_works_of_nobody',
      rights: 'CC0',
      'content-tier': 1,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'B'
    },
    {
      'record-id': '/213/TYUIOP_FG_the_collected_works_of_nobody_in_particular',
      rights: 'CC-BY-SA',
      'content-tier': 1,
      'metadata-tier-average': 'A',
      'metadata-tier-language': 'B',
      'metadata-tier-elements': 'A',
      'metadata-tier-classes': 'A'
    },
    {
      'record-id': '/324/UVBNMJ_GH_the_collected_anthology',
      rights: 'CC-BY-SA-NC',
      'content-tier': 0,
      'metadata-tier-average': 'D',
      'metadata-tier-language': 'D',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'D'
    },
    {
      'record-id': '/322/UVVBN_EF_the_collected_works',
      rights: 'In Copyright',
      'content-tier': 3,
      'metadata-tier-average': 'C',
      'metadata-tier-language': 'C',
      'metadata-tier-elements': 'C',
      'metadata-tier-classes': 'C'
    },
    {
      'record-id': '/321/UVXXXX_HJ_the_collected_anthology',
      rights: 'CC-BY',
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
export class DatasetContentSummaryComponent implements AfterViewInit {
  @ViewChild('pieCanvas') pieCanvasEl: ElementRef;

  pieDimension = '';
  pieLabels: Array<string> = [];
  pieData: Array<number> = [];
  ready = false;
  summaryData = responseData;
  gridData = responseData.records as Array<ContentSummaryRow>;

  /**
   * fmtDataForChart
   * converts grid data into dimension summary data (pieData / pieLabels)
   * @param { string } dimension - the dimension to represent
   **/
  fmtDataForChart(dimension = 'rights'): void {
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.fmtDataForChart();
      this.ready = true;
    });
  }
}
