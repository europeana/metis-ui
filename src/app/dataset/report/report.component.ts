import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import {
  errorNotification,
  httpErrorNotification,
  Notification,
  ReportRequest,
  successNotification,
} from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent {
  constructor(private workflows: WorkflowService, private errorService: ErrorService) {}

  isVisible: boolean;
  isLoading: boolean;
  notification?: Notification;

  // tslint:disable-next-line: no-any
  errors: any;

  @ViewChild('errorsRef') errorsRef: ElementRef;

  @Output() closed = new EventEmitter<void>();

  @Input() set reportRequest(request: ReportRequest | undefined) {
    this.notification = undefined;
    this.errors = undefined;

    if (request) {
      this.isVisible = true;
      this.isLoading = true;
      this.workflows.getReport(request.taskId, request.topology).subscribe(
        (report) => {
          this.isLoading = false;
          if (report && report.errors && report.errors.length) {
            this.errors = report.errors;
          } else {
            this.errors = [];
            this.notification = errorNotification('Report is empty.');
          }
        },
        (err: HttpErrorResponse) => {
          const error = this.errorService.handleError(err);
          this.notification = httpErrorNotification(error);
          this.isLoading = false;
        },
      );
    } else {
      this.isVisible = false;
      this.isLoading = false;
    }
  }

  reportKeys(o: Object): string[] {
    return o ? Object.keys(o) : [];
  }

  closeReport(): void {
    this.closed.emit();
  }

  copyReport(): void {
    const element = this.errorsRef.nativeElement;

    window.getSelection().removeAllRanges();
    const range = document.createRange();
    range.selectNode(element);
    window.getSelection().addRange(range);

    document.execCommand('copy');

    window.getSelection().removeAllRanges();

    this.notification = successNotification('The report has been copied');
  }

  // tslint:disable-next-line: no-any
  isObject(val: any): boolean {
    return typeof val === 'object';
  }
}
