import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap, ModalConfirmService, SubscriptionManager } from 'shared';
import { problemPatternData } from '../_data';
import {
  ProblemOccurrence,
  ProblemPattern,
  ProblemPatternDescriptionBasic,
  ProblemPatternId,
  ProblemPatternsDataset,
  ProblemPatternSeverity,
  RecordAnalysis
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
  public problemPatternData = problemPatternData;

  _problemPatternsRecord: Array<ProblemPattern>;
  _problemPatternsDataset: ProblemPatternsDataset;
  modalInstanceId = 'modalDescription_dataset';
  visibleProblemPatternId: ProblemPatternId;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() recordId: string;
  @Input() enableDynamicInfo = false;

  @Input() set problemPatternsDataset(problemPatternsDataset: ProblemPatternsDataset) {
    problemPatternsDataset.problemPatternList.forEach((pp: ProblemPattern) => {
      pp.recordAnalysisList.forEach((record: RecordAnalysis) => {
        record.problemOccurrenceList.forEach((x: ProblemOccurrence) => {
          x.affectedRecordIdsShowing = true;
        });
      });
    });
    this._problemPatternsDataset = problemPatternsDataset;
  }

  get problemPatternsDataset(): ProblemPatternsDataset {
    return this._problemPatternsDataset;
  }

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

  openLink(event: { ctrlKey: boolean; preventDefault: () => void }, recordId: string): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.openLinkEvent.emit(recordId);
    }
  }

  getWarningClassMap(basicDescription: ProblemPatternDescriptionBasic): ClassMap {
    const severity = basicDescription.problemPatternSeverity;
    return {
      warning: severity === ProblemPatternSeverity.WARNING,
      error: severity === ProblemPatternSeverity.ERROR,
      fatal: severity === ProblemPatternSeverity.FATAL,
      notice: severity === ProblemPatternSeverity.NOTICE
    };
  }

  showDescriptionModal(problemPatternId: ProblemPatternId): void {
    this.visibleProblemPatternId = problemPatternId;
    this.subs.push(this.modalConfirms.open(this.modalInstanceId).subscribe());
  }
}
