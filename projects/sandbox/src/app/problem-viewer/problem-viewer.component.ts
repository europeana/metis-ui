import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProblemPattern, ProblemPatternsDataset, ProblemPatternSeverity } from '../_models';
import { formatDate } from '@angular/common';

@Component({
  selector: 'sb-problem-viewer',
  templateUrl: './problem-viewer.component.html',
  styleUrls: ['./problem-viewer.component.scss']
})
export class ProblemViewerComponent {
  public formatDate = formatDate;
  public ProblemPatternSeverity = ProblemPatternSeverity;
  datasetId: string;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() problemPatternsRecord: Array<ProblemPattern>;
  @Input() problemPatternsDataset: ProblemPatternsDataset;
  @Input() recordId: string;

  openLink(recordId: string): void {
    this.openLinkEvent.emit(recordId);
  }
}
