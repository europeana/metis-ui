import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  Output,
  ViewChild
} from '@angular/core';
import { take } from 'rxjs/operators';

import { ModalConfirmComponent, ModalConfirmService, SubscriptionManager } from 'shared';
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
export class ReportSimpleComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly translate = inject(TranslateService);
  private readonly workflows = inject(WorkflowService);

  reportRequest = input.required<ReportRequestWithData>();
  reportLoading = input<boolean>(false);

  notification?: Notification;
  modalReportId = 'modal-report-id';

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReport = new EventEmitter<void>();

  constructor() {
    super();

    effect(() => {
      const request = this.reportRequest();
      if (!request) return;

      if (request.message && request.message.length > 0) {
        this.triggerModal();
      }
      if (request.errors) {
        this.triggerModal();
        if (request.errors.length === 0) {
          this.notification = errorNotification(this.translate.instant('reportEmpty'));
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
    this.notification = undefined;
    this.closeReport.emit();
  }

  /** copyReport
  /* - copies report to clipboard
  *  - sets notification
  */
  copyReport(win = window): void {
    const selection = win.getSelection();
    if (selection) {
      navigator.clipboard.writeText(this.contentRef.nativeElement.innerText);
      this.notification = successNotification(this.translate.instant('reportCopied'));
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
  /* @param {string} id - the record id
  */
  downloadRecord(
    id: string,
    detail: { identifier?: string; additionalInfo?: string; downloadError?: HttpErrorResponse }
  ): void {
    const match = /(?:http(?:.)*records\/)?(\w*)/.exec(id);
    if (!match?.[1]) {
      return;
    }
    if (id !== match[1] && match[0] === match[1]) {
      return;
    }
    const recordId = match[1];
    this.subs.push(
      this.workflows
        .getRecordFromPredecessor(
          this.reportRequest().workflowExecutionId!,
          this.reportRequest().pluginType as PluginType,
          [recordId]
        )
        .subscribe({
          next: (samples: XmlSample[]) => {
            if (samples && samples.length > 0) {
              triggerXmlDownload(samples[0]);
            }
            detail.downloadError = undefined;
          },
          error: (error: HttpErrorResponse) => {
            detail.downloadError = error;
          }
        })
    );
  }

  /** triggerModal
  /* sets component visibilty
  */
  triggerModal(): void {
    this.subs.push(
      this.modalConfirms
        .open(this.modalReportId)
        .pipe(take(1))
        .subscribe(() => {
          this.close();
        })
    );
  }
}
