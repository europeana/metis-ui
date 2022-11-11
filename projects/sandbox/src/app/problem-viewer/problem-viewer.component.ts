import { formatDate } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

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
export class ProblemViewerComponent extends SubscriptionManager implements OnInit {
  public formatDate = formatDate;
  public ProblemPatternSeverity = ProblemPatternSeverity;
  public ProblemPatternId = ProblemPatternId;
  public problemPatternData = problemPatternData;

  _problemPatternsRecord: Array<ProblemPattern>;
  _problemPatternsDataset: ProblemPatternsDataset;
  modalInstanceId = 'modalDescription_dataset';
  problemCount = 0;
  scrollSubject = new BehaviorSubject(true);
  visibleProblemPatternId: ProblemPatternId;
  viewerVisibleIndex = 0;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() recordId: string;
  @Input() enableDynamicInfo = false;
  @ViewChildren('problemType', { read: ElementRef }) problemTypes: QueryList<ElementRef>;

  @Input() set problemPatternsDataset(problemPatternsDataset: ProblemPatternsDataset) {
    this.problemCount = 0;
    // use timer to prevent ExpressionChangedAfterIthasBeenCheckedError
    setTimeout(() => {
      this.problemCount = problemPatternsDataset.problemPatternList.length;
    });
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
    this.problemCount = 0;
    // use timer to prevent ExpressionChangedAfterIthasBeenCheckedError
    setTimeout(() => {
      this.problemCount = problemPatternsRecord.length;
    });
    this.modalInstanceId = `modalDescription_record`;
    this._problemPatternsRecord = problemPatternsRecord;
  }

  get problemPatternsRecord(): Array<ProblemPattern> {
    return this._problemPatternsRecord;
  }

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  /** getScrollableParent
   *
   * @returns HTMLElement or null
   **/
  getScrollableParent(problemIndex = 0): HTMLElement | null {
    if (this.problemTypes) {
      const problem = this.problemTypes.get(problemIndex);
      if (problem && problem.nativeElement) {
        return problem.nativeElement.parentNode;
      }
    }
    return null;
  }

  /** canScrollUp
   * template utility for arrow availability
   * @returns boolean
   **/
  canScrollUp(): boolean {
    const scrollEl = this.getScrollableParent();
    if (scrollEl && scrollEl.scrollTop > 0) {
      return scrollEl.scrollTop > 0;
    }
    return false;
  }

  /** canScrollDown
   * template utility for arrow availability
   * @returns boolean
   **/
  canScrollDown(): boolean {
    const scrollEl = this.getScrollableParent();
    if (scrollEl && scrollEl.scrollHeight > 0) {
      return !(scrollEl.scrollTop + scrollEl.offsetHeight >= scrollEl.scrollHeight);
    }
    return false;
  }

  /** ngOnInit
   * bind (debounced) scrollSubject to the updateViewerVisibleIndex function
   **/
  ngOnInit(): void {
    this.subs.push(
      this.scrollSubject
        .pipe(
          debounceTime(100),
          tap(() => {
            this.updateViewerVisibleIndex();
          })
        )
        .subscribe()
    );
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

  /** skipProblem
   * @param { number } index - the problem index
   * updates scrollTop on the parent of the indexed ViewChild
   **/
  skipToProblem(index: number): void {
    if (index < 0) {
      index = 0;
    }
    const prob = this.problemTypes.get(index);
    if (prob) {
      prob.nativeElement.parentNode.scrollTop = prob.nativeElement.offsetTop - 8;
      this.updateViewerVisibleIndex();
    }
  }

  /** updateViewerVisibleIndex
   * updates the viewerVisibleIndex according to the scrollHeight
   **/
  updateViewerVisibleIndex(): void {
    this.problemTypes.forEach((prob, index) => {
      const distance = prob.nativeElement.parentNode.scrollTop + 32;
      if (distance >= prob.nativeElement.offsetTop) {
        this.viewerVisibleIndex = index;
      }
    });
  }

  /**
   * onScroll
   *  - bound by (scroll) in the html
   **/
  onScroll($event: Event): void {
    const tgt = ($event.target as unknown) as HTMLElement;
    if (tgt.closest('.problem-viewer')) {
      this.scrollSubject.next(true);
    }
  }
}
