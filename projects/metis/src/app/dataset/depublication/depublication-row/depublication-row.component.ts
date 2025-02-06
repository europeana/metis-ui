import { DatePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  DepublicationDeletionInfo,
  DepublicationStatus,
  RecordDepublicationInfoDeletable
} from '../../../_models';
import { CheckboxComponent } from 'shared';

@Component({
  selector: 'app-depublication-row',
  templateUrl: './depublication-row.component.html',
  styleUrls: ['./depublication-row.component.scss'],
  imports: [CheckboxComponent, DatePipe, NgIf]
})
export class DepublicationRowComponent {
  public DepublicationStatus = DepublicationStatus;

  @Input() record: RecordDepublicationInfoDeletable;
  @Output() checkEvents: EventEmitter<DepublicationDeletionInfo> = new EventEmitter();
  @ViewChild('depublicationTemplate', { static: true }) depublicationTemplate: TemplateRef<
    HTMLElement
  >;

  checkboxDisabled(): boolean {
    return this.record.depublicationStatus !== DepublicationStatus.PENDING;
  }

  onChange(val: boolean): void {
    this.record.deletion = val;
    this.checkEvents.emit({
      recordId: this.record.recordId,
      deletion: val
    } as DepublicationDeletionInfo);
  }
}
