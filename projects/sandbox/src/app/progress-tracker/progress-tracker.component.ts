import { Component, Input } from '@angular/core';
import { Dataset, DatasetStatus, ProgressByStep, StepStatus, StepStatusClass } from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ModalConfirmService, SubscriptionManager } from 'shared';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent extends SubscriptionManager {
  @Input() progressData: Dataset;
  @Input() datasetId: number;
  @Input() isLoading: boolean;

  modalIdErrors = 'confirm-modal-errors';
  detailIndex: number;
  expandedWarning = false;

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  /**
   * getFormattedCreationDate
   * Template utility to format the progressData creationDate as dd/mm/yyyy, hh:mm:ss
   * @returns string
   **/
  getFormattedCreationDate(): string {
    const dateData = this.progressData['dataset-info']['creation-date'];
    if (!dateData) {
      return '';
    }
    const padNumber = (n: number): string => {
      return n < 10 ? `0${n}` : `${n}`;
    };
    const date = new Date(dateData);
    const rTime = [date.getHours(), date.getMinutes(), date.getSeconds()].map(padNumber).join(':');
    const rDate = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
      .map(padNumber)
      .join('/');
    return `${rDate}, ${rTime}`;
  }

  /**
   * getLabelClass
   * Template utility to get css class based on the StepStatus
   * @param { StepStatus } step - the step status
   * @returns string
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
   * Trigger the modal open
   * @param { number } detailIndex - the item to open
   **/
  showErrorsForStep(detailIndex: number): void {
    this.detailIndex = detailIndex;
    this.subs.push(this.modalConfirms.open(this.modalIdErrors).subscribe());
  }

  /**
   * toggleExpandedWarning
   * Toggles this.expandedWarning
   **/
  toggleExpandedWarning() {
    this.expandedWarning = !this.expandedWarning;
  }
}
