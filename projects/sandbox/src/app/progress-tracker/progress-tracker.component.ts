import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  Dataset,
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  ProgressError,
  RecordReportRequest,
  StepStatus,
  StepStatusClass
} from '../_models';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap, ModalConfirmService, SubscriptionManager } from 'shared';
import { DatasetContentSummaryComponent } from '../dataset-content-summary';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss']
})
export class ProgressTrackerComponent extends SubscriptionManager {
  public formatDate = formatDate;
  public DatasetStatus = DatasetStatus;
  public DisplayedTier = DisplayedTier;

  public DisplayedSubsection = DisplayedSubsection;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';

  _progressData: Dataset;

  @Input() enableDynamicInfo = false;
  @Input() enableDatasetTierDisplay = false;
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
    if (
      this.activeSubSection === DisplayedSubsection.TIERS &&
      this.progressData.status !== DatasetStatus.IN_PROGRESS
    ) {
      this.unseenDataProgress = true;
    } else {
      this.unseenDataProgress = false;
    }
  }

  get progressData(): Dataset {
    return this._progressData;
  }

  @Input() datasetId: number;
  @Input() isLoading: boolean;
  @Input() showing: boolean;

  @Output() openReport = new EventEmitter<RecordReportRequest>();

  activeSubSection = DisplayedSubsection.PROGRESS;
  modalIdErrors = 'confirm-modal-errors';
  detailIndex: number;
  expandedWarning = false;
  isLoadingTierData = false;
  unseenDataProgress = false;
  warningViewOpened = [false, false];
  warningDisplayedTier: DisplayedTier;

  @Input() formValueDatasetId?: number;
  @ViewChild(DatasetContentSummaryComponent, { static: false })
  datasetTierDisplay: DatasetContentSummaryComponent;

  constructor(private readonly modalConfirms: ModalConfirmService) {
    super();
  }

  getOrbConfigSubNav(i: DisplayedSubsection): ClassMap {
    const isLoadingTierData = i === DisplayedSubsection.TIERS && this.isLoadingTierData;
    const isLoadingProgressData = i === DisplayedSubsection.PROGRESS && this.isLoading;
    const indicateTier =
      i === DisplayedSubsection.TIERS &&
      this.datasetTierDisplay &&
      this.datasetTierDisplay.lastLoadedId === this.formValueDatasetId;
    const indicateProgress =
      i === DisplayedSubsection.PROGRESS && this.formValueDatasetId === this.datasetId;

    const unseenDataProgress = this.unseenDataProgress && i === DisplayedSubsection.PROGRESS;

    return {
      'warning-animated': unseenDataProgress,
      info: unseenDataProgress,
      'indicator-orb':
        isLoadingTierData || isLoadingProgressData || indicateProgress || indicateTier,
      spinner: isLoadingTierData || isLoadingProgressData,
      'track-processing-orb': i === DisplayedSubsection.PROGRESS,
      'is-active': this.activeSubSection === i,
      'pie-orb': i === DisplayedSubsection.TIERS
    };
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
   * setActiveSubSection
   * @param { DisplayedSubsection } index - the subsection index
   **/
  setActiveSubSection(index: DisplayedSubsection): void {
    this.activeSubSection = index;
    if (this.activeSubSection === DisplayedSubsection.PROGRESS) {
      this.unseenDataProgress = false;
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
   * handleTierLoadingChange
   * @param { boolean } status
   **/
  handleTierLoadingChange(status: boolean): void {
    this.isLoadingTierData = status;
  }

  /**
   * toggleExpandedWarning
   * Toggles this.expandedWarning
   **/
  toggleExpandedWarning(): void {
    this.expandedWarning = !this.expandedWarning;
  }

  /**
   * formatError
   * Stringifies ProgressError
   * @param { ProgressError } e
   **/
  formatError(e: ProgressError): string {
    return JSON.stringify(e, null, 4);
  }
}
