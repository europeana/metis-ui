import { JsonPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { Observable } from 'rxjs';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { DataPollingComponent } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import { IsScrollableDirective } from '../_directives';
import { DebiasReport, DebiasState } from '../_models';
import { SandboxService } from '../_services';
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
  public apiSettings = apiSettings;
  public DebiasState = DebiasState;
  public isoLanguageNames = isoLanguageNames;

  constructor() {
    super();
  }

  @Input() datasetId: string;

  startPolling(): void {
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
