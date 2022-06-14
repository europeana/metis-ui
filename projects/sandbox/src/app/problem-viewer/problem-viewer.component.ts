import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { SubscriptionManager, ModalConfirmService } from 'shared';
import {
  ProblemPattern,
  ProblemPatternsDataset,
  ProblemPatternId,
  ProblemPatternSeverity
} from '../_models';

@Component({
  selector: 'sb-problem-viewer',
  templateUrl: './problem-viewer.component.html',
  styleUrls: ['./problem-viewer.component.scss']
})
export class ProblemViewerComponent extends SubscriptionManager {
  public formatDate = formatDate;
  public ProblemPatternSeverity = ProblemPatternSeverity;
  public ProblemPatternId = ProblemPatternId;

  public problemPatternIdSeverities = {
    P1: ProblemPatternSeverity.NOTICE,
    P2: ProblemPatternSeverity.WARNING,
    P3: ProblemPatternSeverity.ERROR,
    P5: ProblemPatternSeverity.FATAL,
    P6: ProblemPatternSeverity.NOTICE,
    P7: ProblemPatternSeverity.WARNING,
    P9: ProblemPatternSeverity.ERROR,
    P12: ProblemPatternSeverity.FATAL
  };

  _problemPatternsRecord: Array<ProblemPattern>;
  datasetId: string;
  modalInstanceId = 'modalDescription_dataset';
  visibleProblemPatternId: ProblemPatternId;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() recordId: string;
  @Input() problemPatternsDataset: ProblemPatternsDataset;

  @Input() set problemPatternsRecord(problemPatternsRecord: Array<ProblemPattern>) {
    this.modalInstanceId = `modalDescription_record`;
    this._problemPatternsRecord = problemPatternsRecord;
  }

  get problemPatternsRecord(): Array<ProblemPattern> {
    return this._problemPatternsRecord;
  }

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  openLink(recordId: string): void {
    this.openLinkEvent.emit(recordId);
  }

  showDescriptionModal(problemPatternId: ProblemPatternId) {
    this.visibleProblemPatternId = problemPatternId;
    this.subs.push(this.modalConfirms.open(this.modalInstanceId).subscribe());
  }
}
