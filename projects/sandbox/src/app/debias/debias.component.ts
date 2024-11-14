import { JsonPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
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
  standalone: true,
  imports: [
    FormatDcFieldPipe,
    FormatLanguagePipe,
    HighlightMatchesAndLinkPipe,
    IsScrollableDirective,
    NgClass,
    NgFor,
    NgIf,
    NgTemplateOutlet,
    JsonPipe,
    SkipArrowsComponent
  ]
})
export class DebiasComponent extends DataPollingComponent {
  debiasHeaderOpen = false;
  debiasReport: DebiasReport;
  private readonly sandbox = inject(SandboxService);
  private readonly csv = inject(ExportCSVService);
  public apiSettings = apiSettings;
  public DebiasState = DebiasState;
  public isoLanguageNames = isoLanguageNames;

  @Input() datasetId: string;
  @ViewChild('downloadAnchor') downloadAnchor: ElementRef;

  constructor() {
    super();
  }

  /** csvDownload
   * generates csv data and invokes download
   **/
  csvDownload(): void {
    const csvValue = this.csv.csvFromDebiasReport(this.debiasReport);
    this.csv.download(csvValue, `${this.datasetId}_debias_report.csv`, this.downloadAnchor);
  }

  /** startPolling
   * begins the data poller for the debias data
   **/
  startPolling(): string {
    const pollerId = this.datasetId + '-debias-' + new Date().toISOString();

    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<DebiasReport> => {
        return this.sandbox.getDebiasReport(this.datasetId);
      },
      false,
      (debiasReport: DebiasReport) => {
        if (debiasReport) {
          this.debiasReport = debiasReport;
          if (debiasReport.state === DebiasState.COMPLETED) {
            this.clearDataPollerByIdentifier(pollerId);
          }
        }
      },
      (err: HttpErrorResponse) => {
        return err;
      },
      pollerId
    );
    return pollerId;
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
