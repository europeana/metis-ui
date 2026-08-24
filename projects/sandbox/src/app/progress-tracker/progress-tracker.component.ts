import { formatDate, I18nPluralPipe, JsonPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ClassMap, ModalConfirmComponent, ModalConfirmService } from 'shared';
import { MatomoService } from '../_services';
import { TextCopyDirective } from '../_directives';
import { RenameStepPipe } from '../_translate';
import { DatasetContentSummaryComponent } from '../dataset-content-summary';
import { DatasetInfoComponent } from '../dataset-info';
import { NavigationOrbsComponent } from '../navigation-orbs';
import { PopOutComponent } from '../pop-out';

import {
  DatasetProgress,
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  ProgressError,
  RecordReportRequest,
  SandboxPageType,
  StepStatus,
  StepStatusClass
} from '../_models';

@Component({
  selector: 'sb-progress-tracker',
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    DatasetInfoComponent,
    NavigationOrbsComponent,
    DatasetContentSummaryComponent,
    ModalConfirmComponent,
    TextCopyDirective,
    NgTemplateOutlet,
    PopOutComponent,
    JsonPipe,
    I18nPluralPipe,
    RenameStepPipe,
    FormsModule
  ]
})
export class ProgressTrackerComponent {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly matomo = inject(MatomoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly formatDate = formatDate;
  public readonly DatasetStatus = DatasetStatus;
  public readonly DisplayedTier = DisplayedTier;
  public readonly DisplayedSubsection = DisplayedSubsection;
  public readonly SandboxPageType = SandboxPageType;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';
  readonly modalIdErrors = 'confirm-modal-errors';

  // Outputs
  openReport = output<RecordReportRequest>();

  // Core Inputs
  recordShortcutRequest = input<string | undefined>(undefined);
  datasetProgress = input.required<DatasetProgress>();
  datasetId = input.required<number>();
  isLoading = input<boolean>(false);
  showing = input<boolean>(false);

  readonly formValueDatasetId = input<number>();

  // Child Queries
  datasetTierDisplay = viewChild('datasetTierDisplay', { read: DatasetContentSummaryComponent });

  // Core Primitive States
  progressData = signal<DatasetProgress | undefined>(undefined);
  detailIndex = signal<number>(-1);
  expandedWarning = signal<boolean>(false);
  isLoadingTierData = signal<boolean>(false);
  warningViewOpened = signal<boolean[]>([false, false]);
  warningDisplayedTier = signal<DisplayedTier>(DisplayedTier.NONE);
  showSteps = signal<boolean>(false);

  // PURE LINKED SIGNAL: Manages view sub-section states with zero side-effects
  activeSubSection = linkedSignal<DatasetProgress, DisplayedSubsection>({
    source: () => this.datasetProgress(),
    computation: (data, previous) => {
      if (data?.status === DatasetStatus.FAILED) {
        return DisplayedSubsection.PROGRESS;
      }
      return previous?.value ?? DisplayedSubsection.PROGRESS;
    }
  });

  // PURE LINKED SIGNAL: Tracks data-driven status modifications cleanly
  unseenDataProgress = linkedSignal<DatasetProgress, boolean>({
    source: () => this.datasetProgress(),
    computation: (data) => {
      if (!data) return false;

      // 1. Snapshot the current tab position at the exact moment the data payload lands
      const userIsCurrentlyOnTiers =
        untracked(() => this.activeSubSection()) === DisplayedSubsection.TIERS;

      // 2. 🚀 THE MASTER FIX: Only flag as unseen if they were on the Tier Stats tab AND the data is active
      return userIsCurrentlyOnTiers && data.status !== DatasetStatus.IN_PROGRESS;
    }
  });

  constructor() {
    // Clean isolated effect block to trigger cross-component data loads safely
    effect(() => {
      const isUnseenActive = this.unseenDataProgress();
      const progressValue = this.progressData();
      const tierDisplay = this.datasetTierDisplay();

      if (isUnseenActive && progressValue && tierDisplay) {
        const failed = progressValue.status === DatasetStatus.FAILED;
        if (!failed) {
          tierDisplay.loadData();
        }
      }
    });

    // Core data mapping engine
    effect(() => {
      const data = this.datasetProgress();
      if (!data) return;

      this.warningViewOpened.set([false, false]);
      this.progressData.set(data);
      this.showSteps.set(false);

      const failed = data.status === DatasetStatus.FAILED;
      this.showSteps.set(!(failed && !data['processed-records']));

      if (failed && data['progress-by-step']) {
        const idx = data['progress-by-step'].findIndex((item: ProgressByStep) => !!item.errors);
        this.detailIndex.set(idx);
      }

      const tierDisplay = this.datasetTierDisplay();
      const statsOpen =
        tierDisplay && tierDisplay.lastLoadedId() === String(this.formValueDatasetId());

      if (statsOpen && tierDisplay) {
        tierDisplay.loadData();
      }

      const tierInfo = data[this.fieldTierZeroInfo];
      if (tierInfo) {
        if (tierInfo[this.fieldMetadataTier] && !tierInfo[this.fieldContentTier]) {
          tierInfo[this.fieldContentTier] = { samples: [], total: 0 };
        }
      }

      this.cdr.markForCheck();
    });

    // Handler for shortcut queries
    effect(() => {
      const request = this.recordShortcutRequest();
      if (typeof request === 'string') {
        this.activeSubSection.set(DisplayedSubsection.TIERS);
      }
    });
  }

  readonly hasContentTier = computed<boolean>(() => {
    const progress = this.progressData();
    const total = progress?.[this.fieldTierZeroInfo]?.[this.fieldContentTier]?.total;
    return (total ?? 0) > 0;
  });

  readonly hasMetadataTier = computed<boolean>(() => {
    const progress = this.progressData();
    const total = progress?.[this.fieldTierZeroInfo]?.[this.fieldMetadataTier]?.total;
    return (total ?? 0) > 0;
  });

  readonly subNavOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const activeSection = this.activeSubSection();
    const loadingState = this.isLoading();
    const tierLoading = this.isLoadingTierData();
    const currentDatasetId = this.datasetId();
    const formDatasetId = this.formValueDatasetId();
    const elTierDisplay = this.datasetTierDisplay();
    const lastLoadedIdStr = elTierDisplay ? elTierDisplay.lastLoadedId() : undefined;
    const lastLoadedId = lastLoadedIdStr ? Number(lastLoadedIdStr) : undefined;
    const numericDatasetId = currentDatasetId ? Number(currentDatasetId) : undefined;
    const numericFormId = formDatasetId ? Number(formDatasetId) : undefined;

    return {
      0: this.calculateOrbConfigSubNav(
        0,
        activeSection,
        loadingState,
        tierLoading,
        numericDatasetId ?? 0,
        numericFormId,
        lastLoadedId
      ),
      1: this.calculateOrbConfigSubNav(
        1,
        activeSection,
        loadingState,
        tierLoading,
        numericDatasetId ?? 0,
        numericFormId,
        lastLoadedId
      )
    };
  });

  readonly popOutInnerRecord = computed<Record<number, ClassMap>>(() => {
    const records: Record<number, ClassMap> = {};

    if (this.hasContentTier()) {
      records[DisplayedTier.CONTENT] = this.getOrbConfigInner(DisplayedTier.CONTENT);
    }
    if (this.hasMetadataTier()) {
      records[DisplayedTier.METADATA] = this.getOrbConfigInner(DisplayedTier.METADATA);
    }
    return records;
  });

  readonly popOutOuterRecord = computed<Record<number, ClassMap>>(() => {
    const records: Record<number, ClassMap> = {};

    if (this.hasContentTier()) {
      records[DisplayedTier.CONTENT] = this.getOrbConfigOuter(DisplayedTier.CONTENT);
    }
    if (this.hasMetadataTier()) {
      records[DisplayedTier.METADATA] = this.getOrbConfigOuter(DisplayedTier.METADATA);
    }
    return records;
  });

  readonly popOutTooltips = computed<string[]>(() => {
    const tooltips: string[] = [];
    if (this.hasContentTier()) {
      tooltips.push('content-tier-zero records found (click to see samples)');
    }
    if (this.hasMetadataTier()) {
      tooltips.push('metadata-tier-zero records found (click to see samples)');
    }
    return tooltips;
  });

  readonly staticOuterRecord = computed<Record<number, ClassMap>>(() => ({}));

  readonly isSubNavVisible = computed<boolean>(() => {
    const isShowing = this.showing();
    const progress = this.progressData();
    return !!(isShowing && progress && progress.status !== DatasetStatus.FAILED);
  });

  readonly subNavTooltips = computed<string[]>(() => {
    return [
      this.unseenDataProgress()
        ? 'Track Dataset Processing (new data loaded)'
        : 'Track Dataset Processing',
      'Dataset Tier Summary'
    ];
  });

  readonly subNavIndicators = computed<Array<string | null>>(() => {
    return [this.unseenDataProgress() ? 'i' : null, null];
  });

  readonly progressSteps = computed<ProgressByStep[]>(() => {
    const data = this.progressData();
    return data && data['progress-by-step'] ? data['progress-by-step'] : [];
  });

  readonly subNavOrbsOuterRecord = computed<Record<number, ClassMap>>(() => {
    return {
      0: { 'sub-orb-container': true },
      1: { 'sub-orb-container': true }
    };
  });

  readonly subNavOrbLinks = computed(() => {
    const activeSection = this.activeSubSection();
    const currentDatasetId = this.datasetId();
    const formDatasetId = this.formValueDatasetId();
    const elTierDisplay = this.datasetTierDisplay();
    const lastLoadedIdStr = elTierDisplay ? elTierDisplay.lastLoadedId() : undefined;
    const lastLoadedId = lastLoadedIdStr ? Number(lastLoadedIdStr) : undefined;
    const numericDatasetId = currentDatasetId ? Number(currentDatasetId) : undefined;
    const numericFormId = formDatasetId ? Number(formDatasetId) : undefined;

    const isCurrentActive = numericDatasetId === numericFormId;
    const hasDataLoaded = lastLoadedId === numericDatasetId;
    const isLocked = !isCurrentActive && !hasDataLoaded;

    return [
      {
        stepTitle: 'Progress',
        disabled: false,
        tooltip: 'view execution timeline',
        active: activeSection === DisplayedSubsection.PROGRESS
      },
      {
        stepTitle: 'Tier Breakdown',
        disabled: isLocked,
        tooltip: isLocked
          ? 'load data to unlock tier breakdown'
          : 'view statistical distribution profiles',
        active: activeSection === DisplayedSubsection.TIERS
      }
    ];
  });

  private calculateOrbConfigSubNav(
    i: DisplayedSubsection,
    activeSubSection: DisplayedSubsection,
    isLoading: boolean,
    isLoadingTierData: boolean,
    datasetId: number,
    formValueDatasetId: number | undefined,
    lastLoadedId: number | undefined
  ): ClassMap {
    const isTierLoading = i === DisplayedSubsection.TIERS && isLoadingTierData;
    const isProgressLoading = i === DisplayedSubsection.PROGRESS && isLoading;

    const indicateTier = i === DisplayedSubsection.TIERS && lastLoadedId === formValueDatasetId;
    const indicateProgress = i === DisplayedSubsection.PROGRESS && formValueDatasetId === datasetId;
    const unseenDataProgress = this.unseenDataProgress() && i === DisplayedSubsection.PROGRESS;

    return {
      'warning-animated': unseenDataProgress,
      info: unseenDataProgress,
      'indicator-orb': !!(isTierLoading || isProgressLoading || indicateProgress || indicateTier),
      spinner: !!(isTierLoading || isProgressLoading),
      'track-processing-orb': i === DisplayedSubsection.PROGRESS,
      'is-active': activeSubSection === i,
      'pie-orb': i === DisplayedSubsection.TIERS
    };
  }

  getOrbConfigInner(i: number): ClassMap {
    return {
      'is-active': this.warningDisplayedTier() === i,
      'content-tier-orb': i === DisplayedTier.CONTENT,
      'metadata-tier-orb': i === DisplayedTier.METADATA,
      'warning-animated': !this.warningViewOpened()[i]
    };
  }

  getOrbConfigOuter(i: number): ClassMap {
    const progress = this.progressData();
    if (progress && i === DisplayedTier.CONTENT) {
      const tierInfo = progress[this.fieldTierZeroInfo];
      if (tierInfo) {
        const infoContentTier = tierInfo[this.fieldContentTier];
        if (infoContentTier && infoContentTier.total === 0) {
          return { hidden: true };
        }
      }
    }
    return {};
  }

  getOrbConfigCount(): number {
    const progress = this.progressData();
    const tierInfo = progress ? progress[this.fieldTierZeroInfo] : undefined;
    if (!tierInfo) return 0;

    const contentCount = (tierInfo[this.fieldContentTier]?.total ?? 0) > 0 ? 1 : 0;
    const metaCount = (tierInfo[this.fieldMetadataTier]?.total ?? 0) > 0 ? 1 : 0;

    return contentCount + metaCount;
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
    if (!this.showing()) {
      this.warningDisplayedTier.set(DisplayedTier.NONE);
      return;
    }
    setTimeout(() => {
      this.warningDisplayedTier.set(DisplayedTier.NONE);
      this.cdr.markForCheck();
    }, 400);
  }

  setActiveSubSection(val: DisplayedSubsection): void {
    this.activeSubSection.set(val);
    if (val === DisplayedSubsection.PROGRESS) {
      this.unseenDataProgress.set(false);
    }
  }

  setWarningView(index: number): void {
    this.warningDisplayedTier.set(index === 0 ? DisplayedTier.CONTENT : DisplayedTier.METADATA);
    const currentOpened = this.warningViewOpened();
    const next = [...currentOpened];
    next[index] = true;
    this.warningViewOpened.set(next);
  }

  showErrorsForStep(index: number, openerRef: HTMLElement, openViaKeyboard = false): void {
    this.detailIndex.set(index);
    this.modalConfirms
      .open(this.modalIdErrors, openViaKeyboard, openerRef)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        if (!this.destroyRef.destroyed) {
          this.cdr.markForCheck();
        }
      });
  }

  invokeFlagClick(detailIndex: number, el: HTMLElement): void {
    if (!el) return;
    const targetAnchor = el.querySelector('.flag') || el.querySelector('.warn') || el;
    this.showErrorsForStep(detailIndex, targetAnchor as HTMLElement);
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
    if (!event.ctrlKey) {
      event.preventDefault();
      this.reportLinkEmit(recordId, openMetadata);
    }
  }

  handleTierLoadingChange(status: boolean): void {
    this.isLoadingTierData.set(status);
  }

  toggleExpandedWarning(): void {
    this.expandedWarning.update((val) => !val);
  }

  getIsContentTierSampled(): boolean {
    const progress = this.progressData();
    const collection = progress?.[this.fieldTierZeroInfo]?.[this.fieldContentTier]?.samples;
    return !!(collection && collection.length > 0);
  }

  getIsMetadataTierSampled(): boolean {
    const progress = this.progressData();
    const collection = progress?.[this.fieldTierZeroInfo]?.[this.fieldMetadataTier]?.samples;
    return !!(collection && collection.length > 0);
  }

  formatError(e: ProgressError): string {
    return JSON.stringify(e, null, 4);
  }

  trackExternalLink(label: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.matomo.trackNavigation(['external', label as any]);
  }
}
