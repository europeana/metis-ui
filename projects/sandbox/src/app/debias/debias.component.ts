import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  effect,
  HostListener,
  inject,
  input,
  model,
  Renderer2,
  signal,
  viewChild
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
  private readonly debias = inject(DebiasService);
  private readonly csv = inject(ExportCSVService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly renderer = inject(Renderer2);

  readonly cssClassDerefLink = 'dereference-link-debias';
  readonly cssClassLoading = 'loading';

  public apiSettings = apiSettings;
  public DebiasState = DebiasState;

  readonly skipArrows = viewChild<SkipArrowsComponent>('skipArrows');

  cachedReports: { [details: string]: DebiasReport } = {};

  signalDebiasInfo = model.required<DebiasInfo>();
  datasetId = input.required<string>();

  debiasHeaderOpen = signal<boolean>(false);
  debiasDetailOpen = signal<boolean>(false);
  debiasReport = signal<DebiasReport | undefined>(undefined);
  debiasDetail = signal<SkosConcept | undefined>(undefined);
  errorDetail = signal<string | undefined>(undefined);
  isBusy = signal<boolean>(false);
  debiasDetailOpener?: HTMLElement;

  constructor() {
    super();

    effect(() => {
      const id = this.datasetId();
      this.isBusy.set(false);
      this.clearDataPollerByIdentifier(id);
      this.debiasReport.set(undefined);
      this.debias.pollDebiasInfo(id, this.signalDebiasInfo);
    });
  }

  reset(): void {
    this.debiasDetail.set(undefined);
    this.debiasDetailOpen.set(false);
    this.debiasHeaderOpen.set(false);
    this.resetSkipArrows();
  }

  resetSkipArrows(): void {
    this.skipArrows()?.skipToItem(0);
  }

  csvDownload(): void {
    const currentReport = this.debiasReport();
    if (currentReport) {
      const csvValue = this.csv.csvFromDebiasReport(currentReport);
      this.csv.download(csvValue, `${this.datasetId()}_debias_report.csv`);
    }
  }

  pollDebiasReport(): void {
    const currentDatasetId = this.datasetId();

    if (this.cachedReports[currentDatasetId]) {
      const cached = this.cachedReports[currentDatasetId];
      this.debiasReport.set(cached);
      if (cached.state === DebiasState.COMPLETED) {
        return;
      }
    }

    this.isBusy.set(true);
    this.clearDataPollerByIdentifier(currentDatasetId);

    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<DebiasReport> => {
        return this.debias.getDebiasReport(currentDatasetId);
      },
      false,
      (report?: DebiasReport) => {
        if (report) {
          this.debiasReport.set(report);
          this.cachedReports[report['dataset-id']] = report;

          if ([DebiasState.COMPLETED, DebiasState.ERROR].includes(report.state)) {
            this.isBusy.set(false);
            if (currentDatasetId) {
              this.clearDataPollerByIdentifier(currentDatasetId);
            }
          }
        }
      },
      (err: HttpErrorResponse) => {
        return err;
      },
      currentDatasetId
    );
  }

  @HostListener('document:keyup.escape', ['$event'])
  fnKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.renderer.removeClass(document.body, ModalConfirmComponent.cssClassModalLocked);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  fnKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.debiasDetailOpen()) {
      e.stopPropagation();
      e.preventDefault();
      this.renderer.addClass(document.body, ModalConfirmComponent.cssClassModalLocked);
      this.closeDebiasDetail(e, true);
    }
  }

  closeDebiasDetail(e: Event, keyboardEvent = false): boolean {
    e.preventDefault();
    e.stopPropagation();
    this.debiasDetailOpen.set(false);
    if (keyboardEvent && this.debiasDetailOpener) {
      this.debiasDetailOpener.contentEditable = 'true';
      this.changeDetector.detectChanges();
      this.debiasDetailOpener.focus();
      this.debiasDetailOpener.contentEditable = 'false';
      this.debiasDetailOpener = undefined;
    }
    return false;
  }

  openDebiasDetail(): void {
    this.debiasDetailOpen.set(true);
  }

  closeDebiasInfo(e: Event): void {
    this.debiasHeaderOpen.set(false);
    e.stopPropagation();
    e.preventDefault();
  }

  toggleDebiasInfo(e: Event): void {
    this.debiasHeaderOpen.update((value) => !value);
    e.stopPropagation();
  }

  clearErrorDetail(): void {
    this.errorDetail.set(undefined);
  }

  @HostListener('click', ['$event', '$event.target'])
  clickInterceptor(e: Event, el?: HTMLElement): void {
    if (!el) {
      return;
    }
    const classList = el.classList;
    if (classList.contains(this.cssClassDerefLink)) {
      classList.add(this.cssClassLoading);
      this.errorDetail.set(undefined);
      const url = `${e.target}`;
      this.debias.derefDebiasInfo(url).subscribe({
        next: (res: DebiasDereferenceResult) => {
          const unwrapped = res.enrichmentBaseResultWrapperList[0];
          if (unwrapped.dereferenceStatus === DebiasDereferenceState.SUCCESS) {
            this.debiasDetail.set(unwrapped.enrichmentBaseList[0]);
            this.openDebiasDetail();
          } else {
            this.errorDetail.set(`Dereference Error: ${unwrapped.dereferenceStatus}`);
          }
          classList.remove(this.cssClassLoading);
          this.debiasDetailOpener = el;
        },
        error: (err: HttpErrorResponse) => {
          this.errorDetail.set(StringifyHttpError(err));
          classList.remove(this.cssClassLoading);
        }
      });
      e.preventDefault();
    }
  }
}
