import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';
import { triggerXmlDownload } from '../../_helpers';
import {
  errorNotification,
  Notification,
  PluginType,
  ReportRequestWithData,
  successNotification,
  XmlSample
} from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-reportsimple',
  templateUrl: './reportsimple.component.html',
  styleUrls: ['./reportsimple.component.scss']
})
export class ReportSimpleComponent extends SubscriptionManager {
  constructor(
    private readonly modalConfirms: ModalConfirmService,
    private readonly translate: TranslateService,
    private readonly workflows: WorkflowService
  ) {
    super();
  }
  notification?: Notification;
  loading: boolean;
  modalReportId = 'modal-report-id';

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReport = new EventEmitter<void>();

  _reportRequest: ReportRequestWithData;
  @Input() set reportRequest(request: ReportRequestWithData) {
    this._reportRequest = request;
    if (request.message && request.message.length > 0) {
      this.triggerModal();
    }
    if (request.errors) {
      this.triggerModal();
      if (request.errors.length === 0) {
        this.notification = errorNotification(this.translate.instant('reportEmpty'));
      }
    }
  }

  get reportRequest(): ReportRequestWithData {
    return this._reportRequest;
  }

  /** splitCamelCase
  /* string transformation
  /* @param {string} s - the string to modify and return
  */
  splitCamelCase(s: string): string {
    return s.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  /** reportLoading
  /* setter for the report loading variable:
  /* - updates the loading variable
  /* - optionallly calls triggerModal
  /* @param {boolean} loading - Input
  */
  @Input() set reportLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      this.triggerModal();
    }
  }

  get reportLoading(): boolean {
    return this.loading;
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
      const element = this.contentRef.nativeElement;
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNode(element);
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
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
    const type = this.reportRequest.pluginType as PluginType;
    return type && ![PluginType.OAIPMH_HARVEST, PluginType.HTTP_HARVEST].includes(type);
  }

  /** downloadRecord
  /* load xml record and invoke its download
  /* @param {string} id - the record id
  */
  downloadRecord(id: string, model: { downloadError?: HttpErrorResponse }): void {
    // get the ecloudId from the identifier
    const match = id.match(/(?:http(?:.)*records\/)?([A-Za-z0-9_]*)/);

    // it counts if the id matches
    if (match && match.length > 1 && (id === match[1] || match[0] !== match[1])) {
      id = match[1];
    } else {
      return;
    }
    this.subs.push(
      this.workflows
        .getRecordFromPredecessor(
          `${this.reportRequest.workflowExecutionId}`,
          this.reportRequest.pluginType as PluginType,
          [id]
        )
        .subscribe(
          (samples: Array<XmlSample>) => {
            triggerXmlDownload(samples[0]);
            model.downloadError = undefined;
          },
          (error: HttpErrorResponse) => {
            model.downloadError = error;
          }
        )
    );
  }

  /** triggerModal
  /* sets component visibilty
  */
  triggerModal(): void {
    this.subs.push(
      this.modalConfirms.open(this.modalReportId).subscribe(() => {
        this.close();
      })
    );
  }
}
