import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ProblemOccurrence,
  ProblemPattern,
  ProblemPatternsDataset,
  RecordAnalysis
} from '../_models';
import { formatDate } from '@angular/common';

@Component({
  selector: 'sb-problem-viewer',
  templateUrl: './problem-viewer.component.html',
  styleUrls: ['./problem-viewer.component.scss']
})
export class ProblemViewerComponent {
  public formatDate = formatDate;
  datasetId: string;
  viewRaw = false;
  _problemPatternsDataset?: ProblemPatternsDataset;
  _problemPatternsRecord?: Array<ProblemPattern>;

  @Output() openLinkEvent = new EventEmitter<string>();

  @Input() set problemPatternsDataset(ppd: ProblemPatternsDataset | undefined) {
    if (ppd) {
      ppd.problemPatternList = this.processProblemOccurrenceMessages(ppd.problemPatternList);
      this._problemPatternsDataset = ppd;
    }
  }
  get problemPatternsDataset(): ProblemPatternsDataset | undefined {
    return this._problemPatternsDataset;
  }

  @Input() set problemPatternsRecord(ppr: Array<ProblemPattern> | undefined) {
    if (ppr) {
      this._problemPatternsRecord = this.processProblemOccurrenceMessages(ppr);
    }
  }
  get problemPatternsRecord(): Array<ProblemPattern> | undefined {
    return this._problemPatternsRecord;
  }

  processProblemOccurrenceMessages(src: Array<ProblemPattern>): Array<ProblemPattern> {
    return src.map((pp: ProblemPattern) => {
      pp.recordAnalysisList.forEach((ra: RecordAnalysis) => {
        ra.problemOccurrenceList.forEach((po: ProblemOccurrence) => {
          const split = po.messageReport.split(': ');
          po.messageReportError = split[0];
          po.messageReportCopy = split.splice(-1, 1).join(': ');
        });
      });
      return pp;
    });
  }

  openLink(recordId: string): void {
    this.openLinkEvent.emit(recordId);
  }
}
