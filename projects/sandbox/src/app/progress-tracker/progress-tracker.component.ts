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
  public DatasetStatus = DatasetStatus;
  public DisplayedTier = DisplayedTier;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';

  _progressData: Dataset;

  @Input() enableDynamicInfo = false;

  @Input() set progressData(data: Dataset) {
    this.warningViewOpened = [false, false];
    const tierInfo = data[this.fieldTierZeroInfo];
    if (tierInfo) {
      // add placeholder content-tier data if only metadata-tier data is present
      if (tierInfo[this.fieldMetadataTier] && !tierInfo[this.fieldContentTier]) {
        tierInfo[this.fieldContentTier] = {
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

  modalIdErrors = 'confirm-modal-errors';
  detailIndex: number;
  expandedWarning = false;
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
      const tierInfo = this.progressData[this.fieldTierZeroInfo];
      if (tierInfo) {
        const infoContentTier = tierInfo[this.fieldContentTier];
        if (infoContentTier && infoContentTier.total === 0) {
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
    const tierInfo = this.progressData[this.fieldTierZeroInfo];
    if (tierInfo) {
      if (tierInfo[this.fieldMetadataTier]) {
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
   * closeWarningView
   * Sets warningDisplayedTier to -1
   * Delays the resetting of warningView to fit with animation
   **/
  closeWarningView(): void {
    if (this.showing) {
      setTimeout(() => {
        this.warningDisplayedTier = -1;
      }, 400);
    }
  }

  /**
   * setWarningView
   * Template utility: navigationOrbs click output
   * @param { number } index - the warning view code
   **/
  setWarningView(index: DisplayedTier): void {
    this.warningDisplayedTier = index;
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
   * reportLinkClicked
   * Emit event to open report
   * @param { string } recordId - the record to open
   * @param { boolean } openMetadata - open the report showing the metadata
   **/
  reportLinkClicked(event: KeyboardEvent, recordId: string, openMetadata: boolean): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.openReport.emit({
        recordId,
        openMetadata
      });
    }
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
