import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { Notification, successNotification } from '../../_models';

@Component({
  selector: 'app-reportsimple',
  templateUrl: './reportsimple.component.html',
  styleUrls: ['./reportsimple.component.scss'],
})
export class ReportSimpleComponent {
  constructor() {}
  isVisible: boolean;
  // tslint:disable-next-line: no-any
  errors: any;
  message: string;
  notification?: Notification;
  loading: boolean;

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReportSimple = new EventEmitter<void>();

  @Input() set reportMsg(msg: string) {
    if (msg) {
      this.isVisible = true;
      this.message = msg;
    }
  }

  // tslint:disable-next-line: no-any
  @Input() set reportErrors(errors: any) {
    if (errors) {
      this.isVisible = true;
      this.loading = false;
      this.errors = errors;
    }
  }

  @Input() set reportLoading(loading: boolean) {
    if (loading) {
      this.loading = loading;
      this.isVisible = true;
    }
  }

  closeReport(): void {
    this.errors = null;
    this.message = '';
    this.notification = undefined;
    this.isVisible = false;
    this.closeReportSimple.emit();
    this.loading = false;
  }

  copyReport(): void {
    const element = this.contentRef.nativeElement;
    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    this.notification = successNotification('The report has been copied');
  }

  reportKeys(o: Object): string[] {
    return o ? Object.keys(o) : [];
  }

  // tslint:disable-next-line: no-any
  isObject(val: any): boolean {
    return typeof val === 'object';
  }
}