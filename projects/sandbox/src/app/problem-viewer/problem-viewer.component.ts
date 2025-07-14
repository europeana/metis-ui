import {
  formatDate,
  NgClass,
  NgFor,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgTemplateOutlet
} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { jsPDF } from 'jspdf';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap, ModalConfirmComponent, ModalConfirmService, SubscriptionManager } from 'shared';
import { problemPatternData } from '../_data';
import {
  DatasetProgress,
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
import { MatomoService, SandboxService } from '../_services';
import { FormatHarvestUrlPipe } from '../_translate/format-harvest-url.pipe';
import { CopyableLinkItemComponent } from '../copyable-link-item/copyable-link-item.component';
import { PopOutComponent } from '../pop-out/pop-out.component';
import { DatasetInfoComponent } from '../dataset-info';
import { SkipArrowsComponent } from '../skip-arrows';

@Component({
  selector: 'sb-problem-viewer',
  templateUrl: './problem-viewer.component.html',
  styleUrls: ['./problem-viewer.component.scss'],
  imports: [
    NgIf,
    NgClass,
    ModalConfirmComponent,
    NgTemplateOutlet,
    NgPlural,
    NgPluralCase,
    NgFor,
    DatasetInfoComponent,
    PopOutComponent,
    CopyableLinkItemComponent,
    FormatHarvestUrlPipe,
    SkipArrowsComponent
  ]
})
export class ProblemViewerComponent extends SubscriptionManager {
  private readonly sandbox = inject(SandboxService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly matomo = inject(MatomoService);

  public formatDate = formatDate;
  public ProblemPatternSeverity = ProblemPatternSeverity;
  public ProblemPatternId = ProblemPatternId;
  public problemPatternData = problemPatternData;

  _problemPatternsRecord: ProblemPatternsRecord;
  _problemPatternsDataset: ProblemPatternsDataset;

  httpErrorRecordLinks?: HttpErrorResponse;
  isLoading = false;
  modalInstanceId = 'modalDescription_dataset';
  pdfDoc: jsPDF;
  problemCount = 0;
  processedRecordData?: ProcessedRecordData;
  visibleProblemPatternId: ProblemPatternId;
  viewerVisibleIndex = 0;

  @Output() openLinkEvent = new EventEmitter<string>();
  @Input() recordId: string;
  @Input() pageData: SandboxPage;

  readonly progressData = input<DatasetProgress>();

  @ViewChild('problemViewerDataset') problemViewerRecord: ElementRef;
  @ViewChild('problemViewerRecord') problemViewerDataset: ElementRef;

  @Input() set problemPatternsDataset(problemPatternsDataset: ProblemPatternsDataset) {
    this.problemCount = problemPatternsDataset.problemPatternList.length;
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
    this.processedRecordData = undefined;
    this.isLoading = false;
    this.problemCount = problemPatternsRecord.problemPatternList.length;
    this.modalInstanceId = `modalDescription_record`;
    this._problemPatternsRecord = problemPatternsRecord;
  }

  get problemPatternsRecord(): ProblemPatternsRecord {
    return this._problemPatternsRecord;
  }

  constructor() {
    super();
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
    this.matomo.trackNavigation(['export', 'pdf']);

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

  /** showDescriptionModal
   * open the problem description modal
   **/
  showDescriptionModal(problemPatternId: ProblemPatternId): void {
    this.visibleProblemPatternId = problemPatternId;
    this.subs.push(this.modalConfirms.open(this.modalInstanceId).subscribe());
  }
}
