import {
  formatDate,
  I18nPluralPipe,
  JsonPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  DecimalPipe
} from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  linkedSignal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  standalone: true,
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
    RenameStepPipe,
    FormsModule,
    DecimalPipe
  ]
})
export class ProgressTrackerComponent extends SubscriptionManager {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly matomo: MatomoService = inject(MatomoService);

  public formatDate = formatDate;
  public DatasetStatus = DatasetStatus;
  public DisplayedTier = DisplayedTier;
  public DisplayedSubsection = DisplayedSubsection;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';

  // --- Inputs & Outputs ---
  recordShortcutRequest = input<string | undefined>(undefined);
  datasetProgress = input.required<DatasetProgress>();
  datasetId = input.required<number>();
  isLoading = input<boolean>(false);
  showing = input<boolean>(false);
  readonly formValueDatasetId = input<number>();
  openReport = output<RecordReportRequest>();

  // --- ViewChild Signal ---
  datasetTierDisplay = viewChild<DatasetContentSummaryComponent>('datasetTierDisplay');

  // --- Reactive State ---
  activeSubSection = linkedSignal({
    source: () => this.recordShortcutRequest(),
    computation: (request) => (request ? DisplayedSubsection.TIERS : DisplayedSubsection.PROGRESS)
  });

  // Pure data signal
  progressData = computed(() => this.datasetProgress());

  // Pure derived boolean
  showSteps = computed(() => {
    const data = this.progressData();
    if (!data) return false;
    const failed = data.status === DatasetStatus.FAILED;
    return !(failed && !data['processed-records']);
  });

  // --- Manual UI State ---
  modalIdErrors = 'confirm-modal-errors';
  detailIndex = -1;
  expandedWarning = false;
  isLoadingTierData = false;
  unseenDataProgress = false;
  warningViewOpened = [false, false];
  warningDisplayedTier: DisplayedTier = DisplayedTier.NONE;

  constructor() {
    super();

    // Side effects handled outside the render loop to prevent NG0100
    effect(() => {
      const data = this.progressData();
      if (!data) return;

      this.warningViewOpened = [false, false];
      this.unseenDataProgress = false;

      if (data.status === DatasetStatus.FAILED) {
        this.detailIndex = data['progress-by-step'].findIndex(
          (item: ProgressByStep) => !!item.errors
        );
      }

      // Sync child component state
      const tierDisplay = this.datasetTierDisplay();
      if (tierDisplay && tierDisplay.lastLoadedId() === this.formValueDatasetId()) {
        tierDisplay.loadData();
      }
    });
  }

  // --- Arrow functions for stable references ---

  getOrbConfigSubNav = (i: DisplayedSubsection): ClassMap => {
    const elTierDisplay = this.datasetTierDisplay();
    const isLoadingTierData = i === DisplayedSubsection.TIERS && this.isLoadingTierData;
    const isLoadingProgressData = i === DisplayedSubsection.PROGRESS && this.isLoading();

    const indicateTier =
      i === DisplayedSubsection.TIERS &&
      elTierDisplay &&
      elTierDisplay.lastLoadedId() === this.formValueDatasetId();

    const indicateProgress =
      i === DisplayedSubsection.PROGRESS && this.formValueDatasetId() === this.datasetId();
    const unseenDataProgress = this.unseenDataProgress && i === DisplayedSubsection.PROGRESS;

    return {
      'warning-animated': unseenDataProgress,
      info: unseenDataProgress,
      'indicator-orb': !!(
        isLoadingTierData ||
        isLoadingProgressData ||
        indicateProgress ||
        indicateTier
      ),
      spinner: !!(isLoadingTierData || isLoadingProgressData),
      'track-processing-orb': i === DisplayedSubsection.PROGRESS,
      'is-active': this.activeSubSection() === i,
      'pie-orb': i === DisplayedSubsection.TIERS
    };
  };

  getOrbConfigInner = (i: number): ClassMap => ({
    'is-active': this.warningDisplayedTier === i,
    'content-tier-orb': i === DisplayedTier.CONTENT,
    'metadata-tier-orb': i === DisplayedTier.METADATA,
    'warning-animated': !this.warningViewOpened[i]
  });

  getOrbConfigOuter = (i: number): ClassMap => {
    const progress = this.progressData();
    if (progress && i === DisplayedTier.CONTENT) {
      const tierInfo = (progress as any)[this.fieldTierZeroInfo];
      if (tierInfo) {
        const infoContentTier = tierInfo[this.fieldContentTier];
        if (infoContentTier && infoContentTier.total === 0) return { hidden: true };
      }
    }
    return {};
  };

  // --- Logic Methods ---

  getOrbConfigCount(): number {
    const progress = this.progressData();
    if (progress) {
      const tierInfo = (progress as any)[this.fieldTierZeroInfo];
      return tierInfo && tierInfo[this.fieldMetadataTier] ? 2 : 1;
    }
    return 0;
  }

  getLabelClass(step: StepStatus): string {
    return StepStatusClass.get(step) ?? 'harvest';
  }

  getStatusClass(step: ProgressByStep): string {
    if (step.fail > 0) return 'fail';
    if (step.warn > 0) return 'warn';
    return step.total > 0 ? (step.success === step.total ? 'success' : 'running') : 'pending';
  }

  closeWarningView(): void {
    if (this.showing()) {
      setTimeout(() => {
        this.warningDisplayedTier = DisplayedTier.NONE;
      }, 400);
    }
  }

  setActiveSubSection(index: DisplayedSubsection): void {
    this.activeSubSection.set(index);
    if (index === DisplayedSubsection.PROGRESS) this.unseenDataProgress = false;
  }

  setWarningView(index: DisplayedTier): void {
    this.warningDisplayedTier = index;
    this.warningViewOpened[index] = true;
  }

  showErrorsForStep(detailIndex: number, openerRef: HTMLElement, openViaKeyboard = false): void {
    this.detailIndex = detailIndex;
    this.subs.push(
      this.modalConfirms
        .open(this.modalIdErrors, openViaKeyboard, openerRef)
        .pipe(take(1))
        .subscribe()
    );
  }

  invokeFlagClick(detailIndex: number, el: HTMLElement): void {
    const flag = el.querySelector('.flag') as HTMLElement;
    if (flag) this.showErrorsForStep(detailIndex, flag);
  }

  reportLinkEmitFromTierStats(recordId: string): void {
    this.matomo.trackNavigation(['link', 'tier-stats-link']);
    this.openReport.emit({ recordId, openMetadata: false });
  }

  reportLinkEmit(recordId: string, openMetadata = false): void {
    this.matomo.trackNavigation(['link', 'pop-out-link']);
    this.openReport.emit({ recordId, openMetadata });
  }

  reportLinkClicked(
    event: MouseEvent | KeyboardEvent,
    recordId: string,
    openMetadata: boolean
  ): void {
    if (event instanceof KeyboardEvent && event.key !== 'Enter') return;
    event.preventDefault();
    this.reportLinkEmit(recordId, openMetadata);
  }

  handleTierLoadingChange(status: boolean): void {
    this.isLoadingTierData = status;
  }
  toggleExpandedWarning(): void {
    this.expandedWarning = !this.expandedWarning;
  }
  formatError(e: ProgressError): string {
    return JSON.stringify(e, null, 4);
  }
  trackExternalLink(label: string): void {
    this.matomo.trackNavigation(['external', label as any]);
  }
}
