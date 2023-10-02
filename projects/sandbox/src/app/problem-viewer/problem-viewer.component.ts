import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { jsPDF } from 'jspdf';

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
  ProblemPatternsRecord,
  ProcessedRecordData,
  RecordAnalysis,
  SandboxPage
} from '../_models';
import { SandboxService } from '../_services';

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

  private readonly sandbox: SandboxService;
  private readonly modalConfirms: ModalConfirmService;

  _problemPatternsRecord: ProblemPatternsRecord;
  _problemPatternsDataset: ProblemPatternsDataset;

  httpErrorRecordLinks?: HttpErrorResponse;
  isLoading = false;
  modalInstanceId = 'modalDescription_dataset';
  pdfDoc: jsPDF;
  problemCount = 0;
  processedRecordData?: ProcessedRecordData;
  scrollSubject = new BehaviorSubject(true);
  visibleProblemPatternId: ProblemPatternId;
  viewerVisibleIndex = 0;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() recordId: string;
  @Input() enableDynamicInfo = false;
  @Input() pageData: SandboxPage;

  @ViewChildren('problemType', { read: ElementRef }) problemTypes: QueryList<ElementRef>;
  @ViewChild('problemViewerDataset') problemViewerRecord: ElementRef;
  @ViewChild('problemViewerRecord') problemViewerDataset: ElementRef;

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

  @Input() set problemPatternsRecord(problemPatternsRecord: ProblemPatternsRecord) {
    this.problemCount = 0;
    this.processedRecordData = undefined;
    this.isLoading = false;

    // use timer to prevent ExpressionChangedAfterIthasBeenCheckedError
    setTimeout(() => {
      this.problemCount = problemPatternsRecord.problemPatternList.length;
    });
    this.modalInstanceId = `modalDescription_record`;
    this._problemPatternsRecord = problemPatternsRecord;
  }

  get problemPatternsRecord(): ProblemPatternsRecord {
    return this._problemPatternsRecord;
  }

  constructor() {
    super();
    this.sandbox = inject(SandboxService);
    this.modalConfirms = inject(ModalConfirmService);
    this.pdfDoc = new jsPDF('p', 'pt', 'a4');
  }

  /** decode
   * @param { string } str - the source
   *
   * @returns the uri-decoded string
   **/
  decode(str: string): string {
    return decodeURIComponent(str);
  }

  /** exportPDF
   * temporarily sets css class 'pdf' on viewer element
   * temporarily sets isBusy on pageData object
   * genrates and saves pdf
   **/
  exportPDF(): void {
    const pageData = this.pageData;
    if (pageData) {
      pageData.isBusy = true;
    }

    const elToExport = this.problemViewerDataset
      ? this.problemViewerDataset.nativeElement
      : this.problemViewerRecord.nativeElement;

    const fileName = this.problemPatternsDataset
      ? `problem-patterns-dataset-${this.problemPatternsDataset.datasetId}.pdf`
      : `problem-patterns-record-${this.decode(
          this.problemPatternsRecord.problemPatternList[0].recordAnalysisList[0].recordId
        )}.pdf`;

    elToExport.classList.add('pdf');

    this.pdfDoc.html(elToExport, {
      callback: function(doc) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);

        const pageCount = doc.internal.pages.length;

        for (let i = 1; i < pageCount; i++) {
          doc.setPage(i);
          doc.text(
            `Page ${i} of ${pageCount - 1}`,
            doc.internal.pageSize.width / 2 - 22,
            doc.internal.pageSize.height - 15
          );
        }

        doc.save(fileName);
        elToExport.classList.remove('pdf');
        if (pageData) {
          pageData.isBusy = false;
        }
      },
      margin: [10, 10, 40, 10],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: elToExport.offsetWidth * 0.82,
      windowWidth: elToExport.offsetWidth
    });
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
      return scrollEl.scrollTop + scrollEl.offsetHeight < scrollEl.scrollHeight;
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

  /** loadRecordLinksData
   * optionally loads RecordReport data
   **/
  loadRecordLinksData(recordId: string): void {
    if (this.problemPatternsRecord && !this.processedRecordData) {
      this.isLoading = true;
      this.subs.push(
        this.sandbox
          .getProcessedRecordData(this.problemPatternsRecord.datasetId, recordId)
          .subscribe({
            next: (prd: ProcessedRecordData) => {
              this.processedRecordData = prd;
              this.isLoading = false;
              this.httpErrorRecordLinks = undefined;
            },
            error: (err: HttpErrorResponse) => {
              this.processedRecordData = undefined;
              this.httpErrorRecordLinks = err;
              this.isLoading = false;
              return err;
            }
          })
      );
    }
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
