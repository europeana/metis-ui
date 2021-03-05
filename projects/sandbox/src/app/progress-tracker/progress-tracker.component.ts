import { Component, Input } from '@angular/core';
import {
  DatasetInfo,
  DatasetInfoStatus,
  ProgressByStep,
  StepStatus,
  StepStatusClass
} from '../_models';
import { ModalConfirmService } from '@shared';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent {
  @Input() progressData: DatasetInfo;
  @Input() datasetId: number;
  @Input() isLoading: boolean;

  modalIdErrors = 'confirm-modal-errors';
  detailIndex: number;

  constructor(private modalConfirms: ModalConfirmService) {}

  /**
   * getLabelClass
   * @param { StepStatus } step - the step status
   * @returns { string } - a css class based on the plugin status
   **/
  getLabelClass(step: StepStatus): string {
    const labelClass = StepStatusClass.get(step);
    return labelClass ? labelClass : '';
  }

  /**
   * getStatusClass
   * @param { ProgressByStep } step - the step
   * @returns { string } - a css class based on the plugin total / success / fail rate
   **/
  getStatusClass(step: ProgressByStep): string {
    return step.total === step.success ? 'success' : step.fail > 0 ? 'fail' : 'warn';
  }

  /**
   * hasLinks
   * Template utility to detect if links are available
   * @returns boolean
   **/
  hasLinks(): boolean {
    return !!this.progressData['portal-preview'] || !!this.progressData['portal-publish'];
  }

  /**
   * isComplete
   * Template utility to detect if processing is complete
   * @returns boolean
   **/
  isComplete(): boolean {
    return this.progressData && this.progressData.status === DatasetInfoStatus.COMPLETED;
  }

  /**
   * confirmModalErrors
   * Trigger the modal open
   * @param { number } detailIndex - the item to open
   **/
  confirmModalErrors(detailIndex: number): void {
    this.detailIndex = detailIndex;
    const sub = this.modalConfirms.open(this.modalIdErrors).subscribe(() => {
      sub.unsubscribe();
    });
  }
}
