import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  DepublicationDeletionInfo,
  DepublicationStatus,
  RecordDepublicationInfoDeletable
} from '../../../_models';

@Component({
  selector: 'app-depublication-row',
  templateUrl: './depublication-row.component.html',
  styleUrls: ['./depublication-row.component.scss']
})
export class DepublicationRowComponent {
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
