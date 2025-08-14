import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  Input,
  ModelSignal,
  Renderer2,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';


import { DataPollingComponent, ModalConfirmComponent, StringifyHttpError } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { IsScrollableDirective } from '../_directives';
import {
  DebiasDereferenceResult,
  DebiasDereferenceState,
  DebiasInfo,
  DebiasReport,
  DebiasState,
  SkosConcept
} from '../_models';
import { DebiasService, ExportCSVService } from '../_services';
import { FormatDcFieldPipe, FormatLanguagePipe, HighlightMatchesAndLinkPipe } from '../_translate';
import { SkipArrowsComponent } from '../skip-arrows';

@Component({
  selector: 'sb-debias',
  templateUrl: './debias.component.html',
  styleUrls: ['./debias.component.scss'],
  imports: [
    FormatDcFieldPipe,
    FormatLanguagePipe,
    HighlightMatchesAndLinkPipe,
    IsScrollableDirective,
    NgClass,
    NgFor,
    NgIf,
    NgTemplateOutlet,
    SkipArrowsComponent
  ]
})
export class DebiasComponent extends DataPollingComponent {
  debiasHeaderOpen = false;
  debiasDetailOpen = false;
  debiasDetailOpener?: HTMLElement;
  debiasReport?: DebiasReport;

  debiasDetail?: SkosConcept;
  errorDetail?: string;
  isBusy: boolean;
  private readonly debias = inject(DebiasService);
  private readonly csv = inject(ExportCSVService);
  changeDetector = inject(ChangeDetectorRef);
  renderer = inject(Renderer2);

  readonly cssClassDerefLink = 'dereference-link-debias';
  readonly cssClassLoading = 'loading';

  public apiSettings = apiSettings;
  public DebiasState = DebiasState;

  @ViewChild('skipArrows') skipArrows: SkipArrowsComponent;

  cachedReports: { [details: string]: DebiasReport } = {};

  _datasetId: string;

  @Input() set datasetId(datasetId: string) {
    if (this._datasetId) {
      // clear existing
      this.isBusy = false;
      this.clearDataPollerByIdentifier(this._datasetId);
      this.debiasReport = undefined;
    }
    this._datasetId = datasetId;
    if (this.cachedReports[datasetId]) {
      // retrieve new
      this.pollDebiasReport();
    }
  }

  get datasetId(): string {
    return this._datasetId;
  }

  reset(): void {
    this.debiasDetail = undefined;
    this.debiasDetailOpen = false;
    this.debiasHeaderOpen = false;
    this.resetSkipArrows();
  }

  /** resetSkipArrows
   * resets the skipArrows index to zero
   **/
  resetSkipArrows(): void {
    if (this.skipArrows) {
      this.skipArrows.skipToItem(0);
    }
  }

  /** csvDownload
   * generates csv data and invokes download
   **/
  csvDownload(): void {
    if (this.debiasReport) {
      const csvValue = this.csv.csvFromDebiasReport(this.debiasReport);
      this.csv.download(csvValue, `${this.datasetId}_debias_report.csv`);
    }
  }

  /** startPolling
   * begins the data poller for the DebiasReport
   **/
  pollDebiasReport(signal?: ModelSignal<DebiasInfo>): void {
    const setSignal = (debiasReport: DebiasReport): void => {
      if (signal) {
        signal.update((value: DebiasInfo) => {
          value.state = debiasReport.state;
          return value;
        });
      }
    };

    // use cached if available
    if (this.cachedReports[this.datasetId]) {
      this.debiasReport = this.cachedReports[this.datasetId];

      setSignal(this.debiasReport);

      if (this.debiasReport.state === DebiasState.COMPLETED) {
        return;
      }
    }

    this.isBusy = true;
    const pollerId = this.datasetId;

    this.clearDataPollerByIdentifier(pollerId);

    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<DebiasReport> => {
        return this.debias.getDebiasReport(this.datasetId);
      },
      false,
      (debiasReport?: DebiasReport) => {
        if (debiasReport) {
          this.debiasReport = debiasReport;
          this.cachedReports[debiasReport['dataset-id']] = debiasReport;
          if (debiasReport.state === DebiasState.COMPLETED) {
            this.isBusy = false;
            if (pollerId) {
              this.clearDataPollerByIdentifier(pollerId);
            }
          }

          setSignal(debiasReport);
        }
      },
      (err: HttpErrorResponse) => {
        return err;
      },
      pollerId
    );
  }

  @HostListener('document:keyup.escape', ['$event'])
  fnKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      // allow keyup events to close the modal
      this.renderer.removeClass(document.body, ModalConfirmComponent.cssClassModalLocked);
    }
  }
  /** fnKeyDown
  /*  close on 'Esc' unless permanent
  */
  @HostListener('document:keydown.escape', ['$event'])
  fnKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.debiasDetailOpen) {
      e.stopPropagation();
      e.preventDefault();
      // prevent the subsequent keyup event from closing the modal
      this.renderer.addClass(document.body, ModalConfirmComponent.cssClassModalLocked);
      this.closeDebiasDetail(e, true);
    }
  }

  /** closeDebiasDetail
   * falsifies debiasDetailOpen
   * uses the contentEditable trick to activate :focus-visible
   * calls preventDefault stops the keyboard from re-opening
   *
   * @param {Event} e
   */
  closeDebiasDetail(e: Event, keyboardEvent = false): boolean {
    e.preventDefault();
    e.stopPropagation();
    this.debiasDetailOpen = false;
    if (keyboardEvent && this.debiasDetailOpener) {
      this.debiasDetailOpener.contentEditable = 'true';
      this.changeDetector.detectChanges();
      this.debiasDetailOpener.focus();
      this.debiasDetailOpener.contentEditable = 'false';
      this.debiasDetailOpener = undefined;
    }
    return false;
  }

  /** openDebiasDetail
   */
  openDebiasDetail(): void {
    this.debiasDetailOpen = true;
  }

  /** closeDebiasInfo
   * falsifies debiasHeaderOpen
   *
   * @param {Event} e
   */
  closeDebiasInfo(e: Event): void {
    this.debiasHeaderOpen = false;
    e.stopPropagation();
    e.preventDefault();
  }

  /** toggleDebiasInfo
   * toggles debiasHeaderOpen
   * @param {Event} e
   **/
  toggleDebiasInfo(e: Event): void {
    this.debiasHeaderOpen = !this.debiasHeaderOpen;
    e.stopPropagation();
  }

  clearErrorDetail(): void {
    this.errorDetail = undefined;
  }

  /** clickInterceptor
   *  intercept clicks on the "literal" innerHTML links to dereference their content
   *  @param {Event} e - the url is the target
   *  @param {HTMLElement} e - the source element
   */
  @HostListener('click', ['$event', '$event.target'])
  clickInterceptor(e: Event, el?: HTMLElement): void {
    if (!el) {
      return;
    }
    const classList = el.classList;
    if (classList.contains(this.cssClassDerefLink)) {
      classList.add(this.cssClassLoading);
      this.errorDetail = undefined;
      const url = `${e.target}`;
      this.debias.derefDebiasInfo(url).subscribe(
        (res: DebiasDereferenceResult) => {
          const unwrapped = res.enrichmentBaseResultWrapperList[0];
          if (unwrapped.dereferenceStatus === DebiasDereferenceState.SUCCESS) {
            this.debiasDetail = unwrapped.enrichmentBaseList[0];
            this.openDebiasDetail();
          } else {
            this.errorDetail = `Dereference Error: ${unwrapped.dereferenceStatus}`;
          }
          classList.remove(this.cssClassLoading);
          this.debiasDetailOpener = el;
        },
        (err: HttpErrorResponse) => {
          this.errorDetail = StringifyHttpError(err);
          classList.remove(this.cssClassLoading);
        }
      );
      e.preventDefault();
    }
  }
}
