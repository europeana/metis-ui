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
  message: string;
  notification?: Notification;

  @ViewChild('contentRef') contentRef: ElementRef;

  @Output() closeReportSimple = new EventEmitter<void>();

  @Input() set openReportSimple(msg: string) {
    if (msg) {
      this.message = msg;
      this.isVisible = true;
    }
  }

  closeReport(): void {
    this.message = '';
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
    this.notification = successNotification('The report has been copied');
  }
}
