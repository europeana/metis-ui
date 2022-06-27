import { formatDate } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  Dataset,
  DatasetStatus,
  ProgressByStep,
  ProgressError,
  StepStatus,
  StepStatusClass
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent extends SubscriptionManager {
  public formatDate = formatDate;

  @Input() progressData: Dataset;
  @Input() datasetId: number;
  @Input() isLoading: boolean;

  modalIdProcessingErrors = 'confirm-modal-processing-error';
  modalIdErrors = 'confirm-modal-errors';
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  detailIndex: number;
  expandedWarning = false;

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  /**
   * getLabelClass
   * Template utility to get css class based on the StepStatus
   * @param { StepStatus } step - the step status
   * @returns string
   **/
  getLabelClass(step: StepStatus): string {
    const labelClass = StepStatusClass.get(step);
    return labelClass ? labelClass : 'harvest';
  }

  /**
   * getStatusClass
   * @param { ProgressByStep } step - the step
   * @returns { string } - a css class based on the plugin total / success / fail rate
   **/
  getStatusClass(step: ProgressByStep): string {
    if (step.total === step.success) {
      return 'success';
    } else if (step.fail > 0) {
      return 'fail';
    } else {
      return 'warn';
    }
  }

  /**
   * isComplete
   * Template utility to detect if processing is complete
   * @returns boolean
   **/
  isComplete(): boolean {
    return this.progressData && this.progressData.status === DatasetStatus.COMPLETED;
  }

  /**
   * showErrorsForStep
   * Shows the error-detail modal
   * @param { number } detailIndex - the item to open
   **/
  showErrorsForStep(detailIndex: number): void {
    this.detailIndex = detailIndex;
    this.subs.push(this.modalConfirms.open(this.modalIdErrors).subscribe());
  }

  /**
   * showProcessingErrors
   * Shows the processing-error modal
   **/
  showProcessingErrors(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdProcessingErrors).subscribe());
  }

  /**
   * showIncompleteDataWarning
   * Shows the incomplete-data warning modal
   **/
  showIncompleteDataWarning(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdIncompleteData).subscribe());
  }

  /**
   * toggleExpandedWarning
   * Toggles this.expandedWarning
   **/
  toggleExpandedWarning(): void {
    this.expandedWarning = !this.expandedWarning;
  }

  formatError(e: ProgressError): string {
    return JSON.stringify(e, null, 4);
  }
}
