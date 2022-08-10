import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Dataset,
  DatasetStatus,
  DisplayedTier,
  ProgressByStep,
  ProgressError,
  RecordReportRequest,
  StepStatus,
  StepStatusClass
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap, ModalConfirmService, SubscriptionManager } from 'shared';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent extends SubscriptionManager {
  public formatDate = formatDate;
  public DisplayedTier = DisplayedTier;
  _progressData: Dataset;

  @Input() set progressData(data: Dataset) {
    if (!this.warningViewOpen) {
      // reset the notification flag unless the user's already looking at it
      this.warningViewOpened = [false, false];
    }
    const tierInfo = data['tier-zero-info'];
    if (tierInfo) {
      // add placeholder content-tier data if only metadata-tier data is present
      if (tierInfo['metadata-tier'] && !tierInfo['content-tier']) {
        tierInfo['content-tier'] = {
          samples: [],
          total: 0
        };
      }
    }
    this._progressData = data;
  }

  get progressData(): Dataset {
    return this._progressData;
  }

  @Input() datasetId: number;
  @Input() isLoading: boolean;
  @Input() showing: boolean;
  @Output() openReport = new EventEmitter<RecordReportRequest>();

  modalIdProcessingErrors = 'confirm-modal-processing-error';
  modalIdErrors = 'confirm-modal-errors';
  modalIdIncompleteData = 'confirm-modal-incomplete-data';
  detailIndex: number;
  expandedWarning = false;

  warningViewOpen = false;
  warningViewOpened = [false, false];
  warningDisplayedTier: DisplayedTier;

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  getOrbConfigInner(i: number): ClassMap {
    return {
      'is-active': this.warningDisplayedTier === i,
      'content-tier-orb': i === DisplayedTier.CONTENT,
      'metadata-tier-orb': i === DisplayedTier.METADATA,
      'warning-animated': !this.warningViewOpened[i]
    };
  }

  getOrbConfigOuter(i: number): ClassMap {
    if (this.progressData && i === DisplayedTier.CONTENT) {
      const tierInfo = this.progressData['tier-zero-info'];
      if (tierInfo) {
        if (tierInfo['content-tier'] && tierInfo['content-tier'].total === 0) {
          return {
            hidden: true
          };
        }
      }
    }
    return {};
  }

  /**
   * getOrbConfigCount
   * @returns { number }
   **/
  getOrbConfigCount(): number {
    const tierInfo = this.progressData['tier-zero-info'];
    if (tierInfo) {
      if (tierInfo['metadata-tier']) {
        return 2;
      }
      return 1;
    }
    return 0;
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
   * closeWarningView
   * Template utility - sets warningViewOpen to false
   * Delays the resetting of warningView to fit with animation
   **/
  closeWarningView(): void {
    if (this.showing) {
      this.warningViewOpen = false;
      setTimeout(() => {
        this.warningDisplayedTier = -1;
      }, 400);
    }
  }

  /**
   * setWarningView
   * navigationOrbs output
   * @param { number } index - the warning view code
   **/
  setWarningView(index: DisplayedTier): void {
    this.warningDisplayedTier = index;
    this.warningViewOpen = true;
    this.warningViewOpened[index] = true;
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
   * reportLinkClicked
   * Emit event to open report
   * @param { string } recordId - the record to open
   * @param { boolean } openMetadata - open the report showing the metadata
   **/
  reportLinkClicked(recordId: string, openMetadata: boolean): void {
    this.openReport.emit({
      recordId,
      openMetadata
    });
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
