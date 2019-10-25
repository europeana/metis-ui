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

  @Input() set reportMsg(msg: string) {
    if (msg && msg.length > 0) {
      this.isVisible = true;
      this.message = msg;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() set reportErrors(errors: any) {
    if (errors) {
      this.isVisible = true;
      this.errors = errors;
      if (this.errors.length === 0) {
        this.notification = errorNotification(this.translate.instant('reportempty'));
      }
    }
  }

  @Input() set reportLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      this.isVisible = true;
    }
  }

  closeReport(): void {
    this.errors = null;
    this.message = '';
    this.notification = undefined;
    this.isVisible = false;
    this.closeReportSimple.emit();
  }

  copyReport(): void {
    const element = this.contentRef.nativeElement;
    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    this.notification = successNotification(this.translate.instant('reportcopied'));
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
