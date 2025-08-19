import {
  formatDate,
  I18nPluralPipe,
  JsonPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import { Component, EventEmitter, inject, input, Input, Output, ViewChild } from '@angular/core';

import { take } from 'rxjs/operators';


import { ClassMap, ModalConfirmComponent, ModalConfirmService, SubscriptionManager } from 'shared';
import { MatomoService } from '../_services';
import {
  DatasetProgress,
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  ProgressError,
  RecordReportRequest,
  StepStatus,
  StepStatusClass
} from '../_models';
import { TextCopyDirective } from '../_directives';
import { RenameStepPipe } from '../_translate';
import { DatasetContentSummaryComponent } from '../dataset-content-summary';
import { DatasetInfoComponent } from '../dataset-info';
import { NavigationOrbsComponent } from '../navigation-orbs';
import { PopOutComponent } from '../pop-out';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss'],
  imports: [
    NgIf,
    DatasetInfoComponent,
    NgClass,
    NavigationOrbsComponent,
    DatasetContentSummaryComponent,
    NgFor,
    ModalConfirmComponent,
    TextCopyDirective,
    NgTemplateOutlet,
    PopOutComponent,
    JsonPipe,
    I18nPluralPipe,
    RenameStepPipe
  ]
})
export class ProgressTrackerComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);

  public formatDate = formatDate;
  public DatasetStatus = DatasetStatus;
  public DisplayedTier = DisplayedTier;
  public DisplayedSubsection = DisplayedSubsection;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';

  private readonly matomo: MatomoService = inject(MatomoService);

  _progressData: DatasetProgress;

  @Input() set progressData(data: DatasetProgress) {
    this.warningViewOpened = [false, false];
    this._progressData = data;

    const statsOpen =
      this.datasetTierDisplay && this.datasetTierDisplay.lastLoadedId === this.formValueDatasetId();

    if (statsOpen) {
      this.datasetTierDisplay.loadData();
    }

    if (data.status === DatasetStatus.FAILED) {
      this.activeSubSection = DisplayedSubsection.PROGRESS;
    }

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

    if (
      this.activeSubSection === DisplayedSubsection.TIERS &&
      this.progressData.status !== DatasetStatus.IN_PROGRESS
    ) {
      this.unseenDataProgress = true;
      if (this.progressData.status !== DatasetStatus.FAILED) {
        this.datasetTierDisplay.datasetId = this.formValueDatasetId() ?? this.datasetId;
        this.datasetTierDisplay.loadData();
      }
    } else {
      this.unseenDataProgress = false;
    }
  }

  get progressData(): DatasetProgress {
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

  readonly formValueDatasetId = input<number>();
  @ViewChild(DatasetContentSummaryComponent, { static: false })
  datasetTierDisplay: DatasetContentSummaryComponent;

  getOrbConfigSubNav(i: DisplayedSubsection): ClassMap {
    const isLoadingTierData = i === DisplayedSubsection.TIERS && this.isLoadingTierData;
    const isLoadingProgressData = i === DisplayedSubsection.PROGRESS && this.isLoading;
    const indicateTier =
      i === DisplayedSubsection.TIERS &&
      this.datasetTierDisplay &&
      this.datasetTierDisplay.lastLoadedId === this.formValueDatasetId();
    const indicateProgress =
      i === DisplayedSubsection.PROGRESS && this.formValueDatasetId() === this.datasetId;

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
    return labelClass ?? 'harvest';
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
        this.warningDisplayedTier = DisplayedTier.NONE;
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
   * @param { HTMLElement } openerRef - the element used to open the dialog
   **/
  showErrorsForStep(detailIndex: number, openerRef: HTMLElement, openViaKeyboard = false): void {
    this.detailIndex = detailIndex;
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdErrors, openViaKeyboard, openerRef)
        .pipe(take(1))
        .subscribe()
    );
  }

  /** invokeFlagClick
   *
   * template utility to invoke the error-dialog with a forward-referenced
   * "opener" element, used as a focus-target when the dialog is opened with
   * a click on the link's containing row, but closed via a key event on the
   * dialog's close button.
   *
   * @param { number } detailIndex - the item to open
   * @param { HTMLElement } openerRef - the parent of the element used to open the dialog
   **/
  invokeFlagClick(detailIndex: number, el: HTMLElement): void {
    this.showErrorsForStep(detailIndex, el.querySelector('.flag') as HTMLElement);
  }

  /**
   * reportLinkEmit
   * Calls emit on this.openReport
   * @param { string } recordId - the record to open
   **/
  reportLinkEmitFromTierStats(recordId: string): void {
    this.matomo.trackNavigation(['link', 'tier-stats-link']);
    this.openReport.emit({
      recordId: recordId,
      openMetadata: false
    });
  }

  /**
   * reportLinkEmit
   * Calls emit on this.openReport
   * @param { string } recordId - the record to open
   * @param { boolean } openMetadata - open the report showing the metadata
   **/
  reportLinkEmit(recordId: string, openMetadata = false): void {
    this.matomo.trackNavigation(['link', 'pop-out-link']);
    this.openReport.emit({
      recordId,
      openMetadata
    });
  }

  /**
   * reportLinkClicked
   * Conditional invocation of this.reportLinkEmit
   * @param { KeyboardEvent } event - the user event
   * @param { string } recordId - the record to open
   * @param { boolean } openMetadata - open the report showing the metadata
   **/
  reportLinkClicked(event: KeyboardEvent, recordId: string, openMetadata: boolean): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.reportLinkEmit(recordId, openMetadata);
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
