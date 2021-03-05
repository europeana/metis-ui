import { Component, Input } from '@angular/core';
import { DatasetInfo, ProgressByStep, StepStatus, StepStatusClass } from '../_models';
import { ModalConfirmService } from '@shared';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent {
  @Input() progressData: DatasetInfo;
  @Input() datasetId: number;

  modalIdErrors = 'confirm-modal-errors';
  detailIndex: number;

  constructor(private modalConfirms: ModalConfirmService) {}

  /** getLabelClass
  /* return a css class based on the plugin status
  */
  getLabelClass(step: StepStatus): string {
    const labelClass = StepStatusClass.get(step);
    return labelClass ? labelClass : '';
  }

  /** getStatusClass
  /* return a css class based on the plugin status
  */
  getStatusClass(step: ProgressByStep): string {
    return step.total === step.success ? 'success' : step.fail > 0 ? 'fail' : 'warn';
  }

  confirmModalErrors(detailIndex: number): void {
    this.detailIndex = detailIndex;
    const sub = this.modalConfirms.open(this.modalIdErrors).subscribe(() => {
      sub.unsubscribe();
    });
  }
}
