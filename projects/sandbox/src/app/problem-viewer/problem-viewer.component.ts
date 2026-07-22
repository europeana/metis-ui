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
  computed,
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

  httpErrorRecordLinks = signal<HttpErrorResponse | undefined>(undefined);
  modalInstanceId = 'modalDescription_dataset';
  processedRecordData?: ProcessedRecordData;
  visibleProblemPatternId: ProblemPatternId;

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

  readonly orbClassMap: ClassMap = { 'element-orb': true };

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

  async createCanvasAndPdf(el: HTMLElement): Promise<{ pdfDoc: any }> {
    const { jsPDF } = await import('jspdf');

    const pdfDoc = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdfDoc.internal.pageSize.getWidth(); // 595.28pt

    const targetTop = 10;
    const targetRight = 10;
    const targetBottom = 40;
    const targetLeft = 10;

    const printableWidth = pdfWidth - targetLeft - targetRight; // 575.28pt
    const virtualWindowWidth = 800; // Total canvas window tracking width
    const scaleMultiplier = printableWidth / virtualWindowWidth;

    return new Promise((resolve) => {
      pdfDoc.html(el, {
        x: targetLeft,
        y: targetTop,
        width: printableWidth,
        windowWidth: virtualWindowWidth,
        autoPaging: 'text',
        margin: [targetTop, 0, targetBottom, 0],
        html2canvas: {
          useCORS: true,
          logging: false,
          scale: scaleMultiplier,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            const clonedViewer = clonedDoc.querySelector('.problem-viewer') as HTMLElement;
            if (clonedViewer) {
              clonedViewer.style.transition = 'none';
              clonedViewer.style.setProperty('opacity', '1', 'important');
              clonedViewer.style.setProperty('background', '#ffffff', 'important');
              clonedViewer.style.setProperty('background-color', '#ffffff', 'important');
              clonedViewer.style.setProperty('font-family', "'Noto Sans', sans-serif", 'important');

              clonedViewer.style.width = '780px';
              clonedViewer.style.maxWidth = '780px';
              clonedViewer.style.boxSizing = 'border-box';
              clonedViewer.style.margin = '0';

              // Forces the ultra-slow delay rule off inside the off-screen sandbox clone
              const clonedHeader = clonedViewer.querySelector('.pdf-header') as HTMLElement;
              if (clonedHeader) {
                clonedHeader.style.setProperty('transition', 'none', 'important');
              }
            }

            const titleElement = clonedDoc.querySelector('.pdf-header h1') as HTMLElement;
            if (titleElement) {
              titleElement.style.setProperty('position', 'absolute', 'important');
              titleElement.style.setProperty('top', '0', 'important');
              titleElement.style.setProperty('right', '0', 'important');
              titleElement.style.setProperty('left', 'auto', 'important');
              titleElement.style.setProperty('transform', 'none', 'important');
              titleElement.style.setProperty('margin', '0', 'important');
              titleElement.style.setProperty('text-align', 'right', 'important');
              titleElement.style.setProperty('font-family', "'Noto Sans', sans-serif", 'important');
            }
          }
        },
        callback: (doc: any) => {
          resolve({ pdfDoc: doc });
        }
      } as any);
    });
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
    const elToExport = pdfViewer as HTMLElement;
    const ppd = this.problemPatternsDataset();
    const ppr = this.problemPatternsRecord();

    const fileName = ppd
      ? `problem-patterns-dataset-${ppd.datasetId}.pdf`
      : `problem-patterns-record-${this.decode(
          ppr?.problemPatternList[0].recordAnalysisList[0].recordId ?? ''
        )}.pdf`;

    const cdRef = (this as any).changeDetector || (this as any).cdr || (this as any).cd;

    const onPdfComplete = (): void => {
      pdfViewer.classList.remove('pdf');
      if (pageData) {
        pageData.isBusy = false;
      }
      this.isBusyPDF.set(false);
      if (cdRef) {
        cdRef.markForCheck();
      }
    };

    if (pageData) {
      pageData.isBusy = true;
    }
    this.isBusyPDF.set(true);
    pdfViewer.classList.add('pdf');

    if (cdRef) {
      cdRef.markForCheck();
      cdRef.detectChanges();
    }

    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const { pdfDoc: pdf } = await this.createCanvasAndPdf(elToExport);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${totalPages}`, pdfWidth / 2 - 22, pdfHeight - 15);
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('PDF generation failure:', error);
    } finally {
      onPdfComplete();
    }
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
            this.httpErrorRecordLinks.set(undefined);
          },
          error: (err: HttpErrorResponse) => {
            this.processedRecordData = undefined;
            this.httpErrorRecordLinks.set(err);
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

  toggleOccurrence(occurrence: any): void {
    occurrence.affectedRecordIdsShowing = !occurrence.affectedRecordIdsShowing;
  }

  getTest(): string {
    return 'test';
  }
}
