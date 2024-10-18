import { JsonPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DataPollingComponent } from 'shared';
import { DebiasReport, DebiasState } from '../_models';
import { SandboxService } from '../_services';
import { HighlightMatchesAndLinkPipe } from '../_translate';
import { SkipArrowsComponent } from '../skip-arrows';

@Component({
  selector: 'sb-debias',
  templateUrl: './debias.component.html',
  styleUrls: ['./debias.component.scss'],
  standalone: true,
  imports: [
    HighlightMatchesAndLinkPipe,
    NgClass,
    NgFor,
    NgIf,
    NgTemplateOutlet,
    JsonPipe,
    SkipArrowsComponent
  ]
})
export class DebiasComponent extends DataPollingComponent {
  debiasReport: DebiasReport;
  private readonly sandbox = inject(SandboxService);
  public DebiasState = DebiasState;

  constructor() {
    super();
  }

  @Input() datasetId: number;

  startPolling(): void {
    const pollerId = this.datasetId + '-uniqueness';

    this.createNewDataPoller(
      2000,
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
}
