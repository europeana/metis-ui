import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { IsScrollableDirective } from '../_directives';
import { DebiasReport, DebiasState } from '../_models';
import { ExportCSVService, SandboxService } from '../_services';
import { FormatDcFieldPipe, FormatLanguagePipe, HighlightMatchesAndLinkPipe } from '../_translate';
import { SkipArrowsComponent } from '../skip-arrows';

import { isoLanguageNames } from '../_data';

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
    SkipArrowsComponent
  ]
})
export class DebiasComponent extends DataPollingComponent {
  debiasHeaderOpen = false;
  debiasReport?: DebiasReport;
  isBusy: boolean;
  private readonly sandbox = inject(SandboxService);
  private readonly csv = inject(ExportCSVService);

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
        return this.sandbox.getDebiasReport(this.datasetId);
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

  /** closeDebiasInfo
   * falsifies debiasHeaderOpen
   **/
  closeDebiasInfo(e: Event): void {
    this.debiasHeaderOpen = false;
    e.stopPropagation();
  }

  /** toggleDebiasInfo
   * toggles debiasHeaderOpen
   **/
  toggleDebiasInfo(e: Event): void {
    this.debiasHeaderOpen = !this.debiasHeaderOpen;
    e.stopPropagation();
  }
}
