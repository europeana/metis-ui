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
  computed,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild
} from '@angular/core';
import { take } from 'rxjs/operators';
import { ClassMap, ModalConfirmComponent, ModalConfirmService, SubscriptionManager } from 'shared';
import {
  DatasetProgress,
  JSPDFType,
  problemPatternData,
  ProblemPatternDescriptionBasic,
  ProblemPatternId,
  ProblemPatternsDataset,
  ProblemPatternSeverity,
  ProblemPatternsRecord,
  ProcessedRecordData,
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

  httpErrorRecordLinks?: HttpErrorResponse;

  modalInstanceId = 'modalDescription_dataset';
  processedRecordData?: ProcessedRecordData;
  visibleProblemPatternId: ProblemPatternId;
  viewerVisibleIndex = 0;

  readonly openLinkEvent = output<string>();

  readonly recordId = input<string | undefined>(undefined);
  readonly pageData = input<SandboxPage>();

  readonly progressData = input<DatasetProgress>();

  readonly problemViewerDataset = viewChild<ElementRef>('problemViewerDataset');
  readonly problemViewerRecord = viewChild<ElementRef>('problemViewerRecord');

  readonly problemPatternsDataset = input<ProblemPatternsDataset>();
  readonly problemPatternsRecord = input<ProblemPatternsRecord>();

  readonly isBusyPDF = signal(false);

  readonly isLoading = linkedSignal({
    source: this.problemPatternsRecord,
    computation: () => false
  });

  readonly problemCount = computed(() => {
    const dataset = this.problemPatternsDataset();
    const record = this.problemPatternsRecord();

    // Return the length of whichever one was last updated/exists
    // (Or add logic to prefer one over the other)
    return record?.problemPatternList.length ?? dataset?.problemPatternList.length ?? 0;
  });

  readonly orbClassMap = () => ({ 'element-orb': true });

  constructor() {
    super();
    effect(() => {
      const data = this.problemPatternsDataset();
      if (!data) return;

      // Perform the mutation logic once when the input changes
      data.problemPatternList.forEach((pp) => {
        pp.recordAnalysisList.forEach((record) => {
          record.problemOccurrenceList.forEach((x) => {
            x.affectedRecordIdsShowing = true;
          });
        });
      });
    });

    effect(() => {
      const recordData = this.problemPatternsRecord();
      if (recordData) {
        // These replace the logic that was in your old setter
        this.processedRecordData = undefined;
        this.isLoading.set(false);
        this.modalInstanceId = `modalDescription_record`;

        // Perform your nested property mutations
        recordData.problemPatternList.forEach((pp) => {
          pp.recordAnalysisList.forEach((record) => {
            record.problemOccurrenceList.forEach((x) => {
              x.affectedRecordIdsShowing = true;
            });
          });
        });
      }
    });
  }

  /** decode
   * @param { string } str - the source
   *
   * @returns the uri-decoded string
   **/
  decode(str: string): string {
    return decodeURIComponent(str);
  }

  async getJsPDF(): Promise<JSPDFType> {
    const jsPDF = (await import('jspdf')).default;
    const pdfDoc = new jsPDF('p', 'pt', 'a4');
    return (pdfDoc as unknown) as JSPDFType;
  }

  /** exportPDF
   * temporarily sets css class 'pdf' on viewer element
   * temporarily sets isBusy on pageData object / isBusyPDF
   * generates and saves pdf
   **/
  async exportPDF(): Promise<void> {
    this.matomo.trackNavigation(['export', 'pdf']);

    const pageData = this.pageData();
    const datasetEl = this.problemViewerDataset();
    const recordEl = this.problemViewerRecord();
    const pdfWrapper = datasetEl ? datasetEl.nativeElement : recordEl?.nativeElement;

    const pdfViewer = pdfWrapper.querySelector('.problem-viewer');
    const elToExport = pdfViewer;
    const ppd = this.problemPatternsDataset();
    const ppr = this.problemPatternsRecord();
    const fileName = ppd
      ? `problem-patterns-dataset-${ppd.datasetId}.pdf`
      : `problem-patterns-record-${this.decode(
          ppr?.problemPatternList[0].recordAnalysisList[0].recordId ?? ''
        )}.pdf`;

    const fontUrl = '/assets/fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf';
    const onPdfComplete = (): void => {
      pdfViewer.classList.remove('pdf');
      if (pageData) {
        pageData.isBusy = false;
      }
      this.isBusyPDF.set(false);
    };

    if (pageData) {
      pageData.isBusy = true;
    }
    this.isBusyPDF.set(true);
    pdfViewer.classList.add('pdf');

    const pdfDoc = await this.getJsPDF();

    pdfDoc.addFont(fontUrl, 'Noto Sans', 'normal');
    pdfDoc.addFont(fontUrl, 'Noto Sans', 'bold');
    pdfDoc.html(elToExport, {
      callback: function(doc: JSPDFType) {
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
        onPdfComplete();
      },
      margin: [10, 10, 40, 10],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: elToExport.offsetWidth * 0.78,
      windowWidth: elToExport.offsetWidth
    });
    return new Promise((resolve) => {
      resolve();
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
    const ppr = this.problemPatternsRecord();
    if (ppr && !this.processedRecordData) {
      this.isLoading.set(true);
      this.subs.push(
        this.sandbox.getProcessedRecordData(ppr.datasetId, recordId).subscribe({
          next: (prd: ProcessedRecordData) => {
            this.processedRecordData = prd;
            this.isLoading.set(false);
            this.httpErrorRecordLinks = undefined;
          },
          error: (err: HttpErrorResponse) => {
            this.processedRecordData = undefined;
            this.httpErrorRecordLinks = err;
            this.isLoading.set(false);
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
    this.subs.push(
      this.modalConfirms
        .open(this.modalInstanceId)
        .pipe(take(1))
        .subscribe()
    );
  }
}
