import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, TemplateRef, viewChild } from '@angular/core';
import { CheckboxComponent } from 'shared';
import {
  DepublicationDeletionInfo,
  DepublicationStatus,
  RecordDepublicationInfoDeletable
} from '../../../_models';

@Component({
  selector: 'app-depublication-row',
  templateUrl: './depublication-row.component.html',
  styleUrls: ['./depublication-row.component.scss'],
  imports: [CheckboxComponent, DatePipe, NgTemplateOutlet]
})
export class DepublicationRowComponent {
  public DepublicationStatus = DepublicationStatus;

  readonly record = input.required<RecordDepublicationInfoDeletable>();
  readonly checkEvents = output<DepublicationDeletionInfo>();
  readonly depublicationTemplate = viewChild.required<TemplateRef<HTMLElement>>(
    'depublicationTemplate'
  );

  readonly checkboxDisabled = computed(() => {
    return this.record().depublicationStatus !== DepublicationStatus.PENDING;
  });

  onChange(val: boolean): void {
    this.checkEvents.emit({
      recordId: this.record().recordId,
      deletion: val
    });
  }
}
