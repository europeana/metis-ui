import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { errorNotification, Notification, successNotification } from '../../_models';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-reportsimple',
  templateUrl: './reportsimple.component.html',
  styleUrls: ['./reportsimple.component.scss']
})
export class ReportSimpleComponent {
  constructor(private readonly translate: TranslateService) {}
  isVisible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  message: string;
  notification?: Notification;
  loading: boolean;

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReportSimple = new EventEmitter<void>();

  /** reportMsg
  /* setter for the report message:
  /* - checks if the specified message is non-blank
  /* - updates the isVisible variable
  */
  @Input() set reportMsg(msg: string) {
    if (msg && msg.length > 0) {
      this.isVisible = true;
      this.message = msg;
    }
  }

  /** reportErrors
  /* setter for the report errors:
  /* - checks if the specified errors is non-empty
  /* - updates the isVisible variable
  /* - updates the notification variable
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() set reportErrors(errors: any) {
    if (errors) {
      this.isVisible = true;
      this.errors = errors;
      if (this.errors.length === 0) {
        this.notification = errorNotification(this.translate.instant('reportEmpty'));
      }
    }
  }

  /** reportLoading
  /* setter for the report loading variable:
  /* - updates the loading variable
  /* - updates the isVisible variable
  */
  @Input() set reportLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      this.isVisible = true;
    }
  }

  /** closeReport
  /* - clears errors
  *  - clears message
  *  - clears notification
  *  - emits close event
  */
  closeReport(): void {
    this.errors = null;
    this.message = '';
    this.notification = undefined;
    this.isVisible = false;
    this.closeReportSimple.emit();
  }

  /** copyReport
  /* - copies report to clipboard
  *  - clears notification
  */
  copyReport(): void {
    const element = this.contentRef.nativeElement;
    window.getSelection()?.removeAllRanges();
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();
    this.notification = successNotification(this.translate.instant('reportCopied'));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportKeys(o: Record<string, any>): string[] {
    return o ? Object.keys(o) : [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isObject(val: any): boolean {
    return typeof val === 'object';
  }
}
