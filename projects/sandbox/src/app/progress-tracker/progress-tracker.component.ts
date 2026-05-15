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
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  linkedSignal,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

import { ClassMap, ModalConfirmComponent, ModalConfirmService } from 'shared';
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
    FormsModule
  ]
})
export class ProgressTrackerComponent {
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly matomo: MatomoService = inject(MatomoService);

  public formatDate = formatDate;
  public DatasetStatus = DatasetStatus;
  public DisplayedTier = DisplayedTier;
  public DisplayedSubsection = DisplayedSubsection;

  readonly fieldContentTier = 'content-tier';
  readonly fieldMetadataTier = 'metadata-tier';
  readonly fieldTierZeroInfo = 'tier-zero-info';

  readonly modalIdErrors = 'confirm-modal-errors';

  recordShortcutRequest = input<string | undefined>(undefined);
  datasetProgress = input.required<DatasetProgress>();
  datasetId = input.required<number>();
  isLoading = input<boolean>(false);
  showing = input<boolean>(false);
  readonly formValueDatasetId = input<number>();
  openReport = output<RecordReportRequest>();

  datasetTierDisplay = viewChild('datasetTierDisplay', { read: DatasetContentSummaryComponent });

  activeSubSection = linkedSignal({
    source: () => this.recordShortcutRequest(),
    computation: (request) => (request ? DisplayedSubsection.TIERS : DisplayedSubsection.PROGRESS)
  });

  progressData = computed(() => this.datasetProgress());

  // Sub-Navigation Dictionary Record (For the standalone <sb-navigation-orbs> tag)
  readonly subNavOrbsInnerRecord = computed<Record<number, ClassMap>>(() => {
    // Read active dependencies so the dictionary reactively recreates on changes
    this.activeSubSection();
    this.isLoading();
    this.datasetTierDisplay();
    return {
      0: this.getOrbConfigSubNav(0),
      1: this.getOrbConfigSubNav(1)
    };
  });

  readonly popOutInnerRecord = computed(() => {
    return {
      0: this.getOrbConfigInner(DisplayedTier.CONTENT),
      1: this.getOrbConfigInner(DisplayedTier.METADATA)
    };
  });

  readonly popOutOuterRecord = computed(() => {
    this.progressData();
    const contentOuter = this.getOrbConfigOuter(DisplayedTier.CONTENT);
    const metadataOuter = this.getOrbConfigOuter(DisplayedTier.METADATA);
    return {
      ...contentOuter,
      ...metadataOuter
    };
  });

  readonly staticOuterRecord = computed<Record<number, ClassMap>>(() => ({}));

  readonly isSubNavVisible = computed<boolean>(() => {
    const isShowing = this.showing();
    const progress = this.progressData();
    return !!(isShowing && progress && progress.status !== this.DatasetStatus.FAILED);
  });

  readonly subNavTooltips = computed<string[]>(() => {
    const hasUnseen = this.unseenDataProgress();
    return [
      hasUnseen ? 'Track Dataset Processing (new data loaded)' : 'Track Dataset Processing',
      'Dataset Tier Summary'
    ];
  });

  readonly subNavIndicators = computed<Array<string | null>>(() => {
    return [this.unseenDataProgress() ? 'i' : null, null];
  });

  showSteps = computed(() => {
    const data = this.progressData();
    if (!data) return false;
    const failed = data.status === DatasetStatus.FAILED;
    return !(failed && !data['processed-records']);
  });

  isLoadingTierData = signal(false);

  detailIndex = signal<number>(-1);
  expandedWarning = signal<boolean>(false);
  unseenDataProgress = signal<boolean>(false);
  warningViewOpened = signal<boolean[]>([false, false]);
  warningDisplayedTier = signal<DisplayedTier>(DisplayedTier.NONE);

  constructor() {
    effect(() => {
      const data = this.progressData();
      if (!data) return;

      this.warningViewOpened.set([false, false]);
      this.unseenDataProgress.set(false);

      if (data.status === DatasetStatus.FAILED) {
        this.detailIndex.set(
          data['progress-by-step'].findIndex((item: ProgressByStep) => !!item.errors)
        );
        this.activeSubSection.set(DisplayedSubsection.PROGRESS);
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
    const isLoadingTierData = i === DisplayedSubsection.TIERS && this.isLoadingTierData();
    const isLoadingProgressData = i === DisplayedSubsection.PROGRESS && this.isLoading();
    const indicateTier =
      i === DisplayedSubsection.TIERS &&
      elTierDisplay &&
      elTierDisplay.lastLoadedId() === this.formValueDatasetId();

    const indicateProgress =
      i === DisplayedSubsection.PROGRESS && this.formValueDatasetId() === this.datasetId();
    const unseenDataProgress = this.unseenDataProgress() && i === DisplayedSubsection.PROGRESS;

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
    'is-active': this.warningDisplayedTier() === i,
    'content-tier-orb': i === DisplayedTier.CONTENT,
    'metadata-tier-orb': i === DisplayedTier.METADATA,
    'warning-animated': !this.warningViewOpened()[i]
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
    this.warningDisplayedTier.set(DisplayedTier.NONE);
    /*
    TODO: restore
    if (this.showing()) {
      setTimeout(() => {
        this.warningDisplayedTier = DisplayedTier.NONE;
      }, 400);
    }
    */
  }

  setActiveSubSection(index: DisplayedSubsection): void {
    this.activeSubSection.set(index);
    if (index === DisplayedSubsection.PROGRESS) {
      this.unseenDataProgress.set(false);
    }
  }

  setWarningView(index: number): void {
    this.warningDisplayedTier.set(index === 0 ? DisplayedTier.CONTENT : DisplayedTier.METADATA);
    this.warningViewOpened.update((opened) => {
      const next = [...opened];
      next[index] = true;
      return next;
    });
  }

  showErrorsForStep(index: number, openerRef: HTMLElement, openViaKeyboard = false): void {
    this.detailIndex.set(index);
    this.modalConfirms
      .open(this.modalIdErrors, openViaKeyboard, openerRef)
      .pipe(take(1))
      .subscribe();
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
    this.matomo.trackNavigation(['external', label as any]);
  }
}
