import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

import { ModalConfirmComponent, ModalConfirmService } from 'shared';
import { errorNotification, successNotification, triggerXmlDownload } from '../../_helpers';
import { LoadAnimationComponent } from '../../load-animation';
import { Notification, PluginType, ReportRequestWithData, XmlSample } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslateService } from '../../_translate';
import { NotificationComponent, TextWithLinksComponent } from '../../shared';

@Component({
  selector: 'app-reportsimple',
  templateUrl: './reportsimple.component.html',
  styleUrls: ['./reportsimple.component.scss'],
  imports: [
    ModalConfirmComponent,
    NgTemplateOutlet,
    LoadAnimationComponent,
    NotificationComponent,
    NgClass,
    TextWithLinksComponent,
    RenameWorkflowPipe
  ]
})
export class ReportSimpleComponent {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly workflows = inject(WorkflowService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reportRequest = input.required<ReportRequestWithData>();
  readonly reportLoading = input<boolean>(false);

  readonly notification = signal<Notification | undefined>(undefined);

  modalReportId = 'modal-report-id';

  readonly contentRef = viewChild.required<ElementRef<HTMLElement>>('contentRef');
  readonly closeReport = output<void>();

  constructor() {
    effect(() => {
      const request = this.reportRequest();
      if (!request) return;

      if (request.message && request.message.length > 0) {
        this.triggerModal();
      }

      if (request.errors) {
        this.triggerModal();

        if (request.errors.length === 0) {
          this.notification.set(errorNotification(this.translate.instant('reportEmpty')));
        }
      }
    });

    effect(() => {
      if (this.reportLoading()) {
        this.triggerModal();
      }
    });
  }

  /** splitCamelCase
  /* string transformation
  /* @param {string} s - the string to modify and return
  */
  splitCamelCase(s: string): string {
    return s.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  /** close
   * clears notification / visibility and emits close event
   */
  close(): void {
    this.notification.set(undefined);
    this.closeReport.emit();
  }

  /** copyReport
  /* - copies report to clipboard
  *  - sets notification
  */
  copyReport(win = window): void {
    const selection = win.getSelection();
    if (selection) {
      navigator.clipboard.writeText(this.contentRef().nativeElement.innerText);
      this.notification.set(successNotification(this.translate.instant('reportCopied')));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportKeys(o: Record<string, any>): string[] {
    return o ? Object.keys(o) : [];
  }

  /** isDownloadable
  /* - template utility to determine if variable is an object
  /* @param {unknown} val - variable to inspect
  */
  isObject(val: unknown): boolean {
    return typeof val === 'object';
  }

  /** isDownloadable
  /* - template utility to determine downloadablity
  */
  isDownloadable(): boolean {
    const type = this.reportRequest().pluginType as PluginType;
    return type && ![PluginType.OAIPMH_HARVEST, PluginType.HTTP_HARVEST].includes(type);
  }

  /** downloadRecord
  /* load xml record and invoke its download
  /* @param {string} recordId - the record id
  /* @param {any} _item - item context state reference target
  */
  downloadRecord(
    recordId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _item: any
  ): void {
    const req = this.reportRequest();

    if (!req?.workflowExecutionId || !recordId || !recordId.startsWith('http') || !req.pluginType) {
      return;
    }

    const castedPluginType = (req.pluginType as unknown) as PluginType;

    let uniqueIdOnly = recordId;
    if (recordId.includes('/records/')) {
      const parts = recordId.split('/records/');
      uniqueIdOnly = parts[1].includes('/') ? parts[1].split('/')[0] : parts[1];
    }

    this.workflows
      .getRecordFromPredecessor(req.workflowExecutionId, castedPluginType, [uniqueIdOnly])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (samples: Array<XmlSample>) => {
          if (samples && samples.length > 0) {
            triggerXmlDownload(samples[0]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.notification.set(errorNotification(err.message));
          if (_item) {
            _item.downloadError = true;
          }
        }
      });
  }

  /** triggerModal
  /* sets component visibilty
  */
  triggerModal(): void {
    this.modalConfirms
      .open(this.modalReportId)
      .pipe(take(1))
      .subscribe(() => {
        this.close();
      });
  }
}
