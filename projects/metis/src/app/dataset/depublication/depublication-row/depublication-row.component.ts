import { Component, input, output, TemplateRef, viewChild } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  DepublicationDeletionInfo,
  DepublicationStatus,
  RecordDepublicationInfoDeletable
} from '../../../_models';
import { CheckboxComponent } from 'shared';

@Component({
  selector: 'app-depublication-row',
  standalone: true,
  templateUrl: './depublication-row.component.html',
  styleUrls: ['./depublication-row.component.scss'],
  imports: [CheckboxComponent, DatePipe, NgTemplateOutlet]
})
export class DepublicationRowComponent {
  public readonly DepublicationStatus = DepublicationStatus;

  // Signal Inputs & Outputs
  public readonly record = input.required<RecordDepublicationInfoDeletable>();
  public readonly checkEvents = output<DepublicationDeletionInfo>();

  // Signal-based ViewChild template query
  public readonly depublicationTemplate = viewChild.required<TemplateRef<HTMLElement>>(
    'depublicationTemplate'
  );

  public checkboxDisabled(): boolean {
    return this.record().depublicationStatus !== DepublicationStatus.PENDING;
  }

  public onChange(val: boolean): void {
    // Note: Mutating record object properties directly is still supported here,
    // but the read hook switches to reading the input signal value wrapper
    this.record().deletion = val;
    this.checkEvents.emit({
      recordId: this.record().recordId,
      deletion: val
    });
  }
}
