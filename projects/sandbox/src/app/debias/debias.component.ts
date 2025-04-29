import { JsonPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, inject, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { IsScrollableDirective } from '../_directives';
import {
  DebiasDereferenceResult,
  DebiasDereferenceState,
  DebiasReport,
  DebiasState,
  SkosConcept
} from '../_models';
import { DebiasService, ExportCSVService } from '../_services';
import { FormatDcFieldPipe, FormatLanguagePipe, HighlightMatchesAndLinkPipe } from '../_translate';
import { SkipArrowsComponent } from '../skip-arrows';

import { isoLanguageNames } from '../_data';

@Component({
  selector: 'sb-debias',
  templateUrl: './debias.component.html',
  styleUrls: ['./debias.component.scss'],
  imports: [
    JsonPipe,
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
  debiasReport?: DebiasReport;
  debiasDetail?: SkosConcept;
  isBusy: boolean;
  private readonly debias = inject(DebiasService);
  private readonly csv = inject(ExportCSVService);

  readonly cssClassDerefLink = 'dereference-link-debias';

  public apiSettings = apiSettings;
  public DebiasState = DebiasState;
  public isoLanguageNames = isoLanguageNames;

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

  constructor() {
    super();
  }

  /** resetSkipArrows
   * resets the skipArrows index to zero
   **/
  resetSkipArrows(): void {
    this.skipArrows.skipToItem(0);
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
  pollDebiasReport(): void {
    // use cached if available
    if (this.cachedReports[this.datasetId]) {
      this.debiasReport = this.cachedReports[this.datasetId];
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
      (debiasReport: DebiasReport) => {
        if (debiasReport) {
          this.debiasReport = debiasReport;
          this.cachedReports[debiasReport['dataset-id']] = debiasReport;
          if (debiasReport.state === DebiasState.COMPLETED) {
            this.isBusy = false;
            this.clearDataPollerByIdentifier(pollerId);
          }
        }
      },
      (err: HttpErrorResponse) => {
        return err;
      },
      pollerId
    );
  }

  closeDebiasDetail(): void {
    this.debiasDetailOpen = false;
  }

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
  }

  /** toggleDebiasInfo
   * toggles debiasHeaderOpen
   * @param {Event} e
   **/
  toggleDebiasInfo(e: Event): void {
    this.debiasHeaderOpen = !this.debiasHeaderOpen;
    console.log('set inert here');
    e.stopPropagation();
  }

  /** clickInterceptor
   *  intercept clicks on the "literal" innerHTML links to dereference their content
   *  @param {Event} e - the url is the target
   *  @param {HTMLElement} e - the source element
   */
  @HostListener('click', ['$event', '$event.target'])
  clickInterceptor(e: Event, el: HTMLElement): void {
    if (el.classList.contains(this.cssClassDerefLink)) {
      const url = `${e.target}`;
      this.debias.derefDebiasInfo(url).subscribe((res: DebiasDereferenceResult) => {
        const unwrapped = res.enrichmentBaseResultWrapperList[0];
        if (unwrapped.dereferenceStatus === DebiasDereferenceState.SUCCESS) {
          this.debiasDetail = unwrapped.enrichmentBaseList[0];
          this.openDebiasDetail();
        }
      });
      e.preventDefault();
    }
  }
}
