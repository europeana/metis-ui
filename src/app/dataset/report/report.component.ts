import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '../../_services';
import { Report } from '../../_models/report';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  // tslint:disable-next-line: no-any
  errors: any;

  @Output() closed = new EventEmitter<void>();

  @Input() set report(value: Report | undefined) {
    if (value && value.errors && value.errors.length) {
      this.errors = value.errors;
    } else {
      this.errors = undefined;
    }
  }

  ngOnInit(): void {
    this.reportKeys = Object.keys;
    this.translate.use('en');
  }

  reportKeys(o: Object): string[] {
    return Object.keys(o);
  }

  closeReport(): void {
    this.closed.emit();
  }

  //tslint:disable-next-line: no-any
  isObject(val: any): boolean {
    return typeof val === 'object';
  }
}
