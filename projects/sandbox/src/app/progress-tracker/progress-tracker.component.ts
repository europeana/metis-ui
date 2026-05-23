import {
  formatDate,
  I18nPluralPipe,
  JsonPipe,
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
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
  imports: [
    NgClass,
    NgFor,
    NgIf,
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

  // State Management Primitives
  activeSubSection = linkedSignal<string | undefined, DisplayedSubsection>({
    source: () => this.recordShortcutRequest(),
    computation: (request) => {
      const res =
        typeof request == 'string' ? DisplayedSubsection.TIERS : DisplayedSubsection.PROGRESS;
      return res;
    }
  });

  progressData = computed<DatasetProgress>(() => this.datasetProgress());
  isLoadingTierData = signal<boolean>(false);
  expandedWarning = signal<boolean>(false);
  warningDisplayedTier = signal<DisplayedTier>(DisplayedTier.NONE);

  readonly unseenDataProgress = linkedSignal<DatasetProgress, boolean>({
    source: () => this.progressData(),
    computation: (): boolean => false
  });

  readonly detailIndex = linkedSignal<DatasetProgress, number>({
    source: () => this.progressData(),
    computation: (data): number => {
      if (data?.status === DatasetStatus.FAILED && data['progress-by-step']) {
        return data['progress-by-step'].findIndex((item: ProgressByStep) => !!item.errors);
      }
      return -1;
    }
  });

  readonly warningViewOpened = linkedSignal<DatasetProgress, boolean[]>({
    source: () => this.progressData(),
    computation: (): boolean[] => [false, false]
  });

  readonly subNavOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    const activeSection = this.activeSubSection();
    const loadingState = this.isLoading();
    const tierLoading = this.isLoadingTierData();
    const currentDatasetId = this.datasetId();
    const formDatasetId = this.formValueDatasetId();

    const elTierDisplay = this.datasetTierDisplay();
    const lastLoadedIdStr = elTierDisplay ? elTierDisplay.lastLoadedId() : undefined;

    // Convert string IDs safely to numbers (or undefined if empty)
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
    return {
      0: this.getOrbConfigInner(DisplayedTier.CONTENT),
      1: this.getOrbConfigInner(DisplayedTier.METADATA)
    };
  });

  readonly popOutOuterRecord = computed<Record<number, ClassMap>>(() => {
    return {
      0: this.getOrbConfigOuter(DisplayedTier.CONTENT),
      1: this.getOrbConfigOuter(DisplayedTier.METADATA)
    } as Record<number, ClassMap>;
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

  showSteps = computed<boolean>(() => {
    const data = this.progressData();
    if (!data) return false;
    return !(data.status === DatasetStatus.FAILED && !data['processed-records']);
  });

  readonly progressSteps = computed<ProgressByStep[]>(() => {
    const data = this.progressData();
    return data && data['progress-by-step'] ? data['progress-by-step'] : [];
  });

  /**
   * calculateOrbConfigSubNav
   * 🚀 THE FIXED CALCULATION ENGINE: Processes class configurations explicitly
   * from primitive parameter variables, keeping the Zoneless change tree decoupled.
   */
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
        if (infoContentTier && infoContentTier.total === 0) return { hidden: true };
      }
    }
    return {};
  }

  getOrbConfigCount(): number {
    const tierInfo = this.progressData()?.[this.fieldTierZeroInfo];
    if (!tierInfo) {
      return 0;
    }

    // Cast both truthy/falsy field references directly to 1 or 0 and sum them
    return +!!tierInfo[this.fieldContentTier] + +!!tierInfo[this.fieldMetadataTier];
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
    queueMicrotask((): void => {
      if (!this.destroyRef.destroyed) {
        this.warningDisplayedTier.set(DisplayedTier.NONE);
        this.cdr.markForCheck();
      }
    });
  }

  setActiveSubSection(val: DisplayedSubsection): void {
    this.activeSubSection.set(val);
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

  /**
   * invokeFlagClick
   * 🚀 THE TARGETING FIX: Looks for error flags first, falls back to warning elements,
   * or uses the clicked element itself if no sub-icons exist. This prevents the event
   * from swallowing clicks on warning rows, forcing showErrorsForStep to run natively.
   */
  invokeFlagClick(detailIndex: number, el: HTMLElement): void {
    if (!el) {
      return;
    }
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

  formatError(e: ProgressError): string {
    return JSON.stringify(e, null, 4);
  }

  trackExternalLink(label: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.matomo.trackNavigation(['external', label as any]);
  }
}
