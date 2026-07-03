import { Location, NgClass, NgIf, NgStyle, PopStateEvent } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { combineLatest, EMPTY, Observable, of, skip, Subscription, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { map, takeWhile } from 'rxjs/operators';
import { catchError, distinctUntilChanged } from 'rxjs/operators';

import { ClassMap, DataPollerInfo, DataPollingComponent, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';

import { KeycloakAuthService } from '../_services';

import { dropInConfDatasets, dropInConfRecords } from '../_data';

import {
  DatasetProgress,
  DatasetStatus,
  DisplayedTier,
  MatomoLabel,
  ProblemPatternAnalysisStatus,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  RecordReport,
  RecordReportRequest,
  SandboxPage,
  SandboxPageType
} from '../_models';
import {
  DropInRecordService,
  MatomoService,
  SandboxConfService,
  SandboxService,
  UserDataService
} from '../_services';
import { CookiePolicyComponent } from '../cookie-policy/cookie-policy.component';
import { DropInComponent } from '../drop-in';
import { HomeComponent } from '../home';
import { HttpErrorsComponent } from '../http-errors/errors.component';
import { NavigationOrbsComponent } from '../navigation-orbs/navigation-orbs.component';
import { PrivacyStatementComponent } from '../privacy-statement';
import { ProblemViewerComponent } from '../problem-viewer';
import { ProgressTrackerComponent } from '../progress-tracker/progress-tracker.component';
import { RecordReportComponent } from '../record-report';
import { RecentComponent } from '../recent';
import { UploadComponent } from '../upload';

enum ButtonAction {
  BTN_PROBLEMS = 'BTN_PROBLEMS',
  BTN_PROGRESS = 'BTN_PROGRESS',
  BTN_RECORD = 'BTN_RECORD'
}

@Component({
  selector: 'sb-sandbox-navigation',
  templateUrl: './sandbox-navigation.component.html',
  styleUrls: ['/sandbox-navigation.component.scss'],
  imports: [
    DropInComponent,
    NgClass,
    NgStyle,
    NgIf,
    NavigationOrbsComponent,
    RouterOutlet,
    UploadComponent,
    HomeComponent,
    ProgressTrackerComponent,
    ProblemViewerComponent,
    FormsModule,
    ReactiveFormsModule,
    RecordReportComponent,
    RecentComponent,
    PrivacyStatementComponent,
    CookiePolicyComponent,
    HttpErrorsComponent
  ]
})
export class SandboxNavigatonComponent extends DataPollingComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly sandbox = inject(SandboxService);
  private readonly matomo = inject(MatomoService);
  public readonly sandboxConf = inject(SandboxConfService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly authService = inject(KeycloakAuthService);
  private readonly userDataService = inject(UserDataService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  public readonly isAuthedExternal = signal(false);

  public readonly dropInRecords = inject(DropInRecordService);
  public ButtonAction = ButtonAction;
  public SandboxPageType = SandboxPageType;
  public apiSettings = apiSettings;

  public dropInConfDatasets = dropInConfDatasets;
  public dropInConfRecords = dropInConfRecords;

  // Component references
  readonly problemViewerRecord = viewChild(ProblemViewerComponent);
  readonly uploadComponent = viewChild(UploadComponent);
  readonly reportComponent = viewChild(RecordReportComponent);

  readonly dropInDatasetId = viewChild<DropInComponent>('dropInDatasetId');
  readonly dropInRecordId = viewChild<DropInComponent>('dropInRecordId');

  // Template references (ElementRef)
  readonly datasetToTrack = viewChild<ElementRef>('datasetToTrack');
  readonly recordToTrack = viewChild<ElementRef>('recordToTrack');

  // Top-level signals

  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());

  formProgress = this.formBuilder.group({
    datasetToTrack: ['', [Validators.required, this.validateDatasetId.bind(this)]]
  });

  formRecord = this.formBuilder.group({
    recordToTrack: ['', [Validators.required, this.validateRecordId.bind(this)]]
  });

  // 🟢 Automatically extracts live values as signals for change-detection tracking
  readonly datasetToTrackSignal = toSignal(this.formProgress.controls.datasetToTrack.valueChanges, {
    initialValue: ''
  });

  readonly recordToTrackSignal = toSignal(this.formRecord.controls.recordToTrack.valueChanges, {
    initialValue: ''
  });

  isMiniNav = false;
  EnumProtocolType = ProtocolType;
  EnumSandboxPageType = SandboxPageType;
  progressRegistry: { [key: string]: DatasetProgress } = {};
  datasetProblemsRegistry: { [key: string]: ProblemPatternsDataset } = {};
  recordReport = signal<RecordReport | undefined>(undefined);
  problemPatternsDataset = signal<ProblemPatternsDataset | undefined>(undefined);
  problemPatternsRecord = signal<ProblemPatternsRecord | undefined>(undefined);

  readonly trackRecordId = signal('');
  readonly progressData = signal<DatasetProgress | undefined>(undefined);
  readonly trackDatasetId = signal('');

  private readonly trackDatasetId$ = toObservable(this.trackDatasetId, {
    injector: this.injector
  }).pipe(distinctUntilChanged()) as Observable<string>;

  readonly datasetInfo = toSignal(
    this.trackDatasetId$.pipe(
      switchMap((id: string) => {
        const sanitizedId = id ? id.trim() : '';
        if (sanitizedId.length === 0) {
          return of(undefined);
        }
        return this.sandbox.getDatasetInfo(sanitizedId).pipe(
          catchError((err: HttpErrorResponse) => {
            if (this.destroyRef.destroyed) {
              return of(undefined);
            }
            this.sandboxConf.updateStepStatus(this.currentStepType(), { error: err });
            this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { isBusy: false });
            this.changeDetector.markForCheck();
            return of(undefined);
          })
        );
      })
    ),
    { injector: this.injector }
  );

  readonly sandboxNavConf = this.sandboxConf.navConf;
  readonly currentStepType = signal<SandboxPageType>(SandboxPageType.HOME);

  public readonly dropInDatasetSource = this.userDataService.getUserDatasetsPolledObservable();

  readonly currentStepIndex = computed(() => this.getStepIndex(this.currentStepType()));

  tooltips: Array<string>;
  recordShortcutRequest = signal<undefined | string>(undefined);

  constructor() {
    super();
    this.tooltips = this.sandboxNavConf().map((item) => item.stepTitle.toLowerCase());
    this.resetPageData();
  }

  /**
   * clearError
   *
   * reset the step error
   **/
  clearError(): void {
    this.sandboxConf.updateStepStatus(this.currentStepType(), { error: undefined });
  }

  /**
   * fnFocusDatasetToTrack
   *
   * @param { boolean } caretSelect
   **/
  fnFocusDatasetToTrack(caretSelect: boolean): void {
    const el = this.datasetToTrack()?.nativeElement;
    el.focus();
    const valLength = el.value.length;
    el.setSelectionRange(caretSelect ? 0 : valLength, valLength);
  }

  fnFocusRecordToTrack(): void {
    this.recordToTrack()?.nativeElement.focus();
  }

  // NAVIAGTION ORBS

  readonly navigationOrbsInnerClasses = computed<Record<number, ClassMap>>(() => {
    const config = this.sandboxNavConf();
    const record: Record<number, ClassMap> = {};

    // Kick-starters: force computed context to execute on every keystroke
    this.datasetToTrackSignal();
    this.recordToTrackSignal();

    if (config) {
      for (let idx = 0; idx < config.length; idx++) {
        record[idx] = this.getNavOrbConfigInner(idx);
      }
    }
    return record;
  });

  readonly navigationOrbsOuterClasses = computed<Record<number, ClassMap>>(() => {
    const config = this.sandboxNavConf();
    const record: Record<number, ClassMap> = {};

    if (config) {
      for (let idx = 0; idx < config.length; idx++) {
        record[idx] = this.getNavOrbConfigOuter(idx);
      }
    }

    return record;
  });

  getNavOrbConfigInner(i: number): ClassMap {
    const stepConf = this.sandboxNavConf()[i];
    if (!stepConf) return {};

    const isProblemOrb = [
      SandboxPageType.PROBLEMS_DATASET,
      SandboxPageType.PROBLEMS_RECORD
    ].includes(stepConf.stepType);
    const isProgressTrack = stepConf.stepType === SandboxPageType.PROGRESS_TRACK;
    const isRecordTrack = stepConf.stepType === SandboxPageType.REPORT;
    const isUpload = this.getIsUpload(i);

    return {
      'is-active': this.currentStepType() === stepConf.stepType,
      'problem-orb': isProblemOrb,
      'progress-orb': isProgressTrack,
      'report-orb': isRecordTrack,
      'top-level-nav': true,
      'upload-orb': isUpload,
      locked: isUpload && !this.isAuthenticated(),
      'indicator-orb': this.getStepIsIndicator(i),
      spinner: !!stepConf.isBusy,
      'indicate-polling': !!stepConf.isPolling
    };
  }

  getNavOrbConfigOuter(i: number): ClassMap {
    const stepConf = this.sandboxNavConf()[i];
    if (!stepConf) return {};

    return {
      'home-orb-container': stepConf.stepType === SandboxPageType.HOME,
      hidden:
        !!stepConf.isHidden ||
        [SandboxPageType.PRIVACY_STATEMENT, SandboxPageType.COOKIE_POLICY].includes(
          stepConf.stepType
        )
    };
  }

  // Add this as a single property inside your SandboxNavigatonComponent class properties
  public readonly navOrbLinks = computed(() => {
    const isAuthed = this.isAuthenticated();

    return this.sandboxNavConf().map((step, index) => {
      // 1. Compute the dynamic zoneless tooltip text
      const tooltipText =
        index === 1 && !isAuthed
          ? 'upload dataset (log in to enable)'
          : step.stepTitle.toLowerCase();

      // 2. Return your exact original project properties without adding missing fields like .url
      return {
        ...step,
        disabled: index === 1 ? !isAuthed : false,
        tooltip: tooltipText
      };
    });
  });

  pushInputsForDropIn = signal(0);

  dropInPush(e: number): void {
    this.pushInputsForDropIn.set(e);
  }

  ngOnInit(): void {
    // 🚀 THE FINAL COLD LOAD FIX: Add skip(1) to drop the startup race condition
    this.trackDatasetId$
      .pipe(
        skip(1), // 👈 Drops the initial cold boot emission so the router handles the foreground fetch uninterrupted
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((id: string) => {
        if (this.destroyRef.destroyed) {
          return;
        }
        this.formProgress.patchValue({ datasetToTrack: id }, { emitEvent: false });

        const progressConfig = this.sandboxNavConf()[
          this.getStepIndex(SandboxPageType.PROGRESS_TRACK)
        ];
        const isColdLoadDuplicate = progressConfig && progressConfig.lastLoadedIdDataset === id;

        if (id && !isColdLoadDuplicate) {
          this.fillAndSubmitProgressForm(false, false);
        }

        this.changeDetector.markForCheck();
      });

    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
      .pipe(
        map(([params, queryParams]) => ({ params, queryParams })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (combined) => {
          const path = this.location.path();
          const preloadDatasetId = combined.params.id;
          const preloadRecordId = combined.queryParams.recordId;
          const problemsView = combined.queryParams.view === 'problems';

          let fnFillForm: (
            isProblems: boolean,
            isRecord: boolean,
            isForeground: boolean
          ) => void = () => {
            // placeholder implementaion
          };
          let stepTypes: { primary: SandboxPageType; secondary: SandboxPageType };

          this.trackDatasetId.set(preloadDatasetId || '');

          if (preloadRecordId) {
            this.trackRecordId.set(decodeURIComponent(preloadRecordId));
            stepTypes = {
              primary: SandboxPageType.PROBLEMS_RECORD,
              secondary: SandboxPageType.REPORT
            };

            fnFillForm = (isProblems: boolean, _, isForeground: boolean): void => {
              this.fillAndSubmitRecordForm(isProblems, false, false, isForeground);
            };
          } else if (preloadDatasetId) {
            this.trackRecordId.set('');

            if (this.progressRegistry[preloadDatasetId]) {
              this.progressData.set(this.progressRegistry[preloadDatasetId]);
            }

            // Map the reference closure to explicitly forward the true foreground page flag
            fnFillForm = (isProblems: boolean, _, isForeground: boolean): void => {
              this.fillAndSubmitProgressForm(isProblems, false, isForeground);
            };

            stepTypes = {
              primary: SandboxPageType.PROBLEMS_DATASET,
              secondary: SandboxPageType.PROGRESS_TRACK
            };
          } else {
            this.trackRecordId.set('');
            fnFillForm = (isProblems: boolean, _, isForeground: boolean): void => {
              this.fillAndSubmitProgressForm(isProblems, false, isForeground);
            };
            stepTypes = {
              primary: SandboxPageType.PROBLEMS_DATASET,
              secondary: SandboxPageType.PROGRESS_TRACK
            };
          }

          // Safe Microtask Queue execution frame
          queueMicrotask(() => {
            if (this.destroyRef.destroyed) return;

            if (/\/new$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), false, false);
            } else if (/privacy-statement$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.PRIVACY_STATEMENT), false, false);
            } else if (/cookie-policy$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.COOKIE_POLICY), false, false);
            } else if (preloadDatasetId || preloadRecordId) {
              const targetType = problemsView ? stepTypes.primary : stepTypes.secondary;
              this.setPage(this.getStepIndex(targetType), false, false);

              // Explicitly pass true for the third argument (isForeground)
              fnFillForm(problemsView, false, true);
            } else {
              if (path.includes('/dataset')) {
                const targetType = problemsView ? stepTypes.primary : stepTypes.secondary;
                this.setPage(this.getStepIndex(targetType), false, false);
                fnFillForm(problemsView, false, true);
              } else {
                this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
              }
            }
            this.changeDetector.markForCheck();
          });
        }
      });

    this.location.subscribe(this.handleLocationPopState.bind(this));
  }

  /**
   * handleLocationPopState
   * capture "back" and "forward" events / sync with form data
   * @param { PopStateEvent } state - the event
   **/
  handleLocationPopState(state: PopStateEvent): void {
    const url = `${state.url}`;
    const ids = /\/dataset\/(\d+)/.exec(url);

    if (!ids || ids.length === 0) {
      // 🚀 THE FIX: Match both '/dataset' and empty root links cleanly
      // without losing validation status on secondary fields
      if (['/dataset', '', '/'].includes(url)) {
        this.trackDatasetId.set('');
        this.trackRecordId.set('');
        this.formProgress.controls.datasetToTrack.setValue('', { emitEvent: false });
        this.formRecord.controls.recordToTrack.setValue('', { emitEvent: false });
      }

      // Reset local component error and busy flags layout
      this.resetPageData();

      if (url === '/new') {
        this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), true, false);
      } else if (url === '' || url === '/') {
        this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
      } else if (url === '/privacy-statement') {
        this.setPage(this.getStepIndex(SandboxPageType.PRIVACY_STATEMENT), false, false);
      } else if (url === '/cookie-policy') {
        this.setPage(this.getStepIndex(SandboxPageType.COOKIE_POLICY), false, false);
      } else {
        this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), true, false);
      }
    } else {
      // 🎯 All of your original deep-parameter form parsing remains 100% untouched:
      this.trackDatasetId.set(ids[1]);
      const regParamRecord = /[?&]recordId=([^&]*)/;
      const regParamProblems = /[?&]view=problems/;

      const matchParamRecord: RegExpMatchArray | null = regParamRecord.exec(url);
      const matchParamProblems = !!regParamProblems.exec(url);

      if (matchParamRecord) {
        this.trackRecordId.set(decodeURIComponent(matchParamRecord[1]));
        this.fillAndSubmitRecordForm(matchParamProblems);
      } else {
        this.formRecord.controls.recordToTrack.setValue('', { emitEvent: false });
        this.fillAndSubmitProgressForm(matchParamProblems, false);
      }
    }

    this.changeDetector.markForCheck();
  }

  /**
   * resetPageData
   * reset variables in the sandboxNavConf object
   **/
  resetPageData(): void {
    this.sandboxNavConf().forEach((step: SandboxPage) => {
      step.error = undefined;
      step.isBusy = false;
    });
  }

  /**
   * validateDatasetId
   *
   * form validator implementation for dataset id field (non-decimal numeric)
   *
   * @param { FormControl } control - the control to validate
   * @returns ValidationErrors object or null
   **/
  validateDatasetId(control: FormControl<string | undefined>): ValidationErrors | null {
    const val = control.value;

    const enableRecordForm = (enable: boolean): void => {
      if (this.formRecord) {
        if (enable) {
          this.formRecord.enable();
        } else {
          this.formRecord.disable();
        }
      }
    };

    if (val) {
      const matches = /\d+/.exec(`${val}`);
      if (!matches || matches[0] !== val) {
        enableRecordForm(false);
        return { invalid: true };
      } else {
        enableRecordForm(true);
      }
    } else {
      enableRecordForm(false);
    }
    return null;
  }

  /** validateRecordId
   *  form validator implementation for record id field (no whitespace)
   *
   * @param {FormControl} control - the input control to validate
   * @returns ValidationErrors object or null
   */
  validateRecordId(control: FormControl<string>): ValidationErrors | null {
    const val = control.value;
    if (!/^\S+$/.exec(val)) {
      return { invalid: true };
    }
    const datasetIdCtrl = this.formProgress.controls.datasetToTrack;
    if (!datasetIdCtrl.valid) {
      return { invalid: true };
    }
    return null;
  }

  /**
   * getFormGroup
   * Returns the correct form for the given SandboxPage
   *
   * @param { SandboxPage } stepConf - the config to evaluate
   * @returns FormGroup
   **/
  getFormGroup(stepConf: SandboxPage): FormGroup | undefined {
    if (stepConf.stepType === SandboxPageType.PROGRESS_TRACK) {
      return this.formProgress;
    } else if (stepConf.stepType === SandboxPageType.REPORT) {
      return this.formRecord;
    } else {
      return this.uploadComponent()?.form();
    }
  }

  /**
   * getStepIndex
   *
   * utility to get the index in the conf by the stepType
   *
   * @param { SandboxPageType } stepType - the type
   * @returns nthe index
   **/
  getStepIndex(stepType: SandboxPageType): number {
    const conf = this.sandboxNavConf();
    return conf.findIndex((step: SandboxPage) => {
      return step.stepType === stepType;
    });
  }

  /**
   * getStepIsIndicator
   *
   * Template utility for setting 'indicator-orb' class on the step orbs
   * @param { number } stepIndex - the SandboxPage index
   *
   * @returns boolean
   **/
  getStepIsIndicator(stepIndex: number): boolean {
    const config = this.sandboxNavConf();
    if (!config || !config[stepIndex]) return false;
    const step = config[stepIndex];

    if (step.stepType === SandboxPageType.UPLOAD) {
      return !this.isAuthenticated(); // Maps to your !this.keycloak.authenticated check
    }

    const valDataset = this.datasetToTrackSignal();
    const valRecord = this.recordToTrackSignal();

    const matchValDataset = step.lastLoadedIdDataset === valDataset;
    const matchValRecord = step.lastLoadedIdRecord === valRecord;
    const matchBoth = matchValDataset && matchValRecord;

    if (step.stepType === SandboxPageType.PROGRESS_TRACK) {
      return matchValDataset && !!this.progressData();
    } else if (step.stepType === SandboxPageType.REPORT) {
      return matchBoth && !!this.recordReport;
    } else if (step.stepType === SandboxPageType.PROBLEMS_DATASET) {
      return matchValDataset && !!this.problemPatternsDataset();
    } else if (step.stepType === SandboxPageType.PROBLEMS_RECORD) {
      return matchBoth && !!this.problemPatternsRecord();
    }

    return !!(this.uploadComponent()?.form && this.uploadComponent()?.form().disabled);
  }

  /**
   * getIsProblem
   * Returns true if the stepType of the SandboxPage at the given index is PROBLEMS_DATASET or PROBLEMS_RECORD
   *
   * @returns boolean
   **/
  getIsProblem(stepIndex: number): boolean {
    return [SandboxPageType.PROBLEMS_DATASET, SandboxPageType.PROBLEMS_RECORD].includes(
      this.sandboxNavConf()[stepIndex].stepType
    );
  }

  /**
   * getIsUpload
   * Returns true if the stepType of the SandboxPage at the given conf index's stepType is UPLOAD
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsUpload(stepIndex: number): boolean {
    return this.sandboxNavConf()[stepIndex].stepType === SandboxPageType.UPLOAD;
  }

  /**
   * showAllRecent
   * allow home page to open the drop in
   **/
  showAllRecent(): void {
    this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), false, true);
    this.changeDetector.detectChanges();
    this.dropInDatasetId()?.openPinnedAll(this.datasetToTrack()?.nativeElement);
    this.changeDetector.markForCheck();
  }

  /**
   * callSetPage
   * Template utility to filter out right click / ctrl click events
   * Conditionally calls this.setPage
   *
   * @param { event } event - the dome event
   * @param { number } stepIndex - the value to set
   * @param { Array<MatomoLabel> } labels - the values to log
   * @param { boolean } reset - flag a reset
   **/
  callSetPage(event: KeyboardEvent, stepIndex: number, labels: Array<string>, reset = false): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.matomo.trackNavigation(labels as Array<MatomoLabel>);
      this.setPage(stepIndex, reset, true);
    }
  }

  goToLogin(): void {
    this.authService.login();
  }

  /**
   * setPage
   * Sets the currentStepIndex and isHidden values
   * Optionally resets the form
   * Optionally invokes this.updateLocation
   *
   * @param { number } stepIndex - the value to set
   * @param { boolean } reset - flag a reset
   * @param { boolean } updateLocation - flag a location update
   * @param { boolean } programmaticClick - flag if click is user-invoked or programmatic
   **/

  setPage(stepIndex: number, reset = false, updateLocation = true, programmaticClick = true): void {
    if (stepIndex === this.getStepIndex(SandboxPageType.UPLOAD) && !this.isAuthenticated()) {
      this.goToLogin();
      return;
    }

    if (reset) {
      const form = this.getFormGroup(this.sandboxNavConf()[stepIndex]);
      if (form && form.disabled) {
        form.enable();
        this.uploadComponent()?.rebuildForm();
      }
    }

    if (!programmaticClick) {
      this.matomo.trackNavigation(['link', 'top-nav']);
    }

    // 1. Extract the active target type safely from the read-only signal snapshot
    const activeStepType = this.sandboxNavConf()[stepIndex].stepType;
    const activeStepTitle = this.sandboxNavConf()[stepIndex].stepTitle;
    document.title = `Metis Sandbox: ${activeStepTitle}`;

    // 2. Update your state primitives safely
    this.currentStepType.set(activeStepType);
    this.isMiniNav = [SandboxPageType.PRIVACY_STATEMENT, SandboxPageType.COOKIE_POLICY].includes(
      activeStepType
    );

    // 3. ✅ Reactively update the configuration signal properties directly via the Service helper
    this.sandboxConf.updateStepStatus(activeStepType, { isHidden: false });
    this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { isHidden: false });
    if (
      [
        SandboxPageType.HOME,
        SandboxPageType.PRIVACY_STATEMENT,
        SandboxPageType.COOKIE_POLICY,
        SandboxPageType.PROGRESS_TRACK
        //SandboxPageType.REPORT
      ].includes(activeStepType)
    ) {
      this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, { isHidden: false });
    }

    this.changeDetector.markForCheck();

    if (updateLocation) {
      if (activeStepType === SandboxPageType.HOME) {
        this.goToLocation('');
      } else if (activeStepType === SandboxPageType.UPLOAD) {
        this.goToLocation('/new');
      } else if (activeStepType === SandboxPageType.PROGRESS_TRACK) {
        this.updateLocation(true, false);
      } else if (activeStepType === SandboxPageType.REPORT) {
        this.updateLocation(true, true, false);
      } else if (activeStepType === SandboxPageType.PROBLEMS_DATASET) {
        this.updateLocation(true, false, true);
      } else if (activeStepType === SandboxPageType.PROBLEMS_RECORD) {
        this.updateLocation(true, true, true);
      } else if (activeStepType === SandboxPageType.PRIVACY_STATEMENT) {
        this.goToLocation('/privacy-statement');
      } else if (activeStepType === SandboxPageType.COOKIE_POLICY) {
        this.goToLocation('/cookie-policy');
      }
    }
  }

  /**
   * progressComplete
   * utility to determine if the progress is complete
   *
   **/
  progressComplete(data: DatasetProgress): boolean {
    return [DatasetStatus.COMPLETED, DatasetStatus.FAILED].includes(data.status);
  }

  /**
   * getConnectClasses
   *
   * @param { string } other - additional class to include with non-empty result
   **/
  getConnectClasses(other: string): ClassMap {
    const res: ClassMap = {};

    if (!(this.formProgress.valid && this.formRecord.valid)) {
      return res;
    }

    const valDataset = this.datasetToTrackSignal();
    const valRecord = this.recordToTrackSignal();

    if (valDataset && valRecord) {
      const match = /\/(\d+)\/\S/.exec(valRecord);
      const connect = valDataset.length > 0 && valRecord.length > 0 && !!match;

      res.connect = connect;
      res.error = connect && match[1] !== valDataset;

      if (connect) {
        res[other] = true;
      }
    }
    return res;
  }

  /**
   * submitDatasetProblemPatterns
   * Submits the trackDatasetId (problem patterns)
   * @param { boolean } inBackground - flags if UI should update
   **/
  submitDatasetProblemPatterns(inBackground = false): void {
    const trackDatasetId = this.trackDatasetId();
    const pollerId = `${trackDatasetId}_problems`;

    if (!inBackground) {
      this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_DATASET, {
        isBusy: true,
        isPolling: true
      });
    }

    this.clearDataPollerByIdentifier(pollerId);
    this.allPollingInfo = this.allPollingInfo.filter((p) => p.identifier !== pollerId);

    const problemPatternsSub = timer(0, apiSettings.interval)
      .pipe(
        switchMap(() => this.sandbox.getProblemPatternsDataset(trackDatasetId)),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeWhile((problemPatternsDataset: ProblemPatternsDataset) => {
          // Stream stays alive ONLY during these two statuses
          return [
            ProblemPatternAnalysisStatus.PENDING,
            ProblemPatternAnalysisStatus.IN_PROGRESS
          ].includes(problemPatternsDataset.analysisStatus);
        }, true), // 'true' includes the final terminating emission (e.g., FINALIZED or ERROR)
        catchError((err: HttpErrorResponse) => {
          this.problemPatternsDataset.set(undefined);

          if (!inBackground) {
            this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_DATASET, {
              lastLoadedIdDataset: undefined
            });
          }

          this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_DATASET, {
            error: err,
            isBusy: false,
            isPolling: false
          });

          this.clearDataPollerByIdentifier(pollerId);
          this.allPollingInfo = this.allPollingInfo.filter((p) => p.identifier !== pollerId);

          this.changeDetector.markForCheck();
          return EMPTY;
        })
      )
      .subscribe({
        next: (problemPatternsDataset: ProblemPatternsDataset) => {
          // Always register the latest data (including the final FINALIZED state)
          this.datasetProblemsRegistry[trackDatasetId] = problemPatternsDataset;

          if (!inBackground) {
            this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_DATASET, {
              lastLoadedIdDataset: this.trackDatasetId(),
              error: undefined
            });
          }

          if (this.trackDatasetId() === trackDatasetId) {
            this.problemPatternsDataset.set(this.datasetProblemsRegistry[trackDatasetId]);
          }

          this.changeDetector.markForCheck();
        },
        complete: () => {
          // Automatically triggers when takeWhile turns false
          this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_DATASET, {
            isBusy: false,
            isPolling: false
          });
          this.clearDataPollerByIdentifier(pollerId);
          this.allPollingInfo = this.allPollingInfo.filter((p) => p.identifier !== pollerId);
          this.changeDetector.markForCheck();
        }
      });

    this.allPollingInfo.push(({
      identifier: pollerId,
      subscription: problemPatternsSub
    } as unknown) as DataPollerInfo);
  }

  /**
   * submitDatasetProgress
   * Submits the trackDatasetId
   * @param { boolean } inBackground - flags if UI should update
   **/
  private progressPollerSubscription?: Subscription;

  submitDatasetProgress(inBackground = false): void {
    const fieldNamePortalPublish = 'portal-preview';
    const datasetId = this.trackDatasetId();
    const isTrackingRecord = !!this.trackRecordId();

    if (
      datasetId &&
      this.progressRegistry &&
      this.progressRegistry[datasetId] &&
      !isTrackingRecord
    ) {
      const data = this.progressRegistry[datasetId];
      if (data) {
        this.trackDatasetId.set(datasetId);
        this.progressData.set(data);
      }

      if (!inBackground) {
        this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
          lastLoadedIdDataset: datasetId,
          error: undefined
        });
      }

      if (data && this.progressComplete(data)) {
        this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
          isBusy: false,
          isPolling: false
        });
        this.changeDetector.markForCheck();
        return;
      }
    }

    if (!inBackground) {
      this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        isBusy: true,
        isPolling: true
      });
    }

    if (this.progressPollerSubscription) {
      this.progressPollerSubscription.unsubscribe();
      const subIndex = this.subs.indexOf(this.progressPollerSubscription);
      if (subIndex > -1) {
        this.subs.splice(subIndex, 1);
      }
    }

    this.progressPollerSubscription = timer(0, apiSettings.interval)
      .pipe(
        switchMap(() => this.sandbox.requestProgress(datasetId)),
        map((progressData: DatasetProgress) => {
          if (
            progressData[fieldNamePortalPublish] &&
            SandboxService.nullUrlStrings.includes(progressData[fieldNamePortalPublish])
          ) {
            delete progressData[fieldNamePortalPublish];
          }
          return progressData;
        }),

        catchError((err: HttpErrorResponse) => {
          if (!inBackground) {
            this.progressData.set(undefined);
          }

          this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
            ...(!inBackground ? { error: err, lastLoadedIdDataset: undefined } : {}),
            isBusy: false,
            isPolling: false
          });

          if (this.progressPollerSubscription) {
            this.progressPollerSubscription.unsubscribe();
            const subIndex = this.subs.indexOf(this.progressPollerSubscription);
            if (subIndex > -1) {
              this.subs.splice(subIndex, 1);
            }
          }

          this.changeDetector.markForCheck();
          return EMPTY;
        })
      )
      .subscribe({
        next: (progressInfo: DatasetProgress) => {
          this.progressRegistry[datasetId] = progressInfo;

          const isCurrentDataset = String(this.trackDatasetId()) === String(datasetId);

          if (isCurrentDataset) {
            this.progressData.set(progressInfo);
          }

          if (!inBackground) {
            this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
              lastLoadedIdDataset: datasetId,
              error: undefined
            });
          }

          if (this.progressComplete(progressInfo)) {
            // Unconditionally lower the busy spinner flag when data completes
            this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
              isBusy: false,
              isPolling: false
            });

            if (this.progressPollerSubscription) {
              this.progressPollerSubscription.unsubscribe();
              const subIndex = this.subs.indexOf(this.progressPollerSubscription);
              if (subIndex > -1) {
                this.subs.splice(subIndex, 1);
              }
            }
          }

          this.changeDetector.markForCheck();
        }
      });

    this.subs.push(this.progressPollerSubscription);
  }

  /**
   * onSubmitProgress
   * Submits the formProgress data if valid
   *
   * @param { ButtonAction } action - the desired action
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   * @param { boolean } programmaticClick - flag if click is user-invoked or programmatic
   **/
  public onSubmitProgress(
    action: ButtonAction,
    updateLocation = false,
    programmaticClick = false,
    changePage = updateLocation
  ): void {
    const targetId = this.formProgress.controls.datasetToTrack.value || this.trackDatasetId();

    // 🚀 THE NAVIGATION BRIDGE FIX:
    // Accept the submission if the form reads as technically valid OR if the target input field
    // contains a valid, complete numeric dataset tracking ID string. This safely bypasses
    // asynchronous PENDING status delays that lock out manual form-driven navigation!
    const hasValidDatasetId = /^\d+$/.test((targetId || '').trim());
    const canProceed = this.formProgress.valid || hasValidDatasetId;

    if (canProceed && targetId) {
      this.trackDatasetId.set(targetId.trim());

      if (updateLocation && !programmaticClick) {
        this.matomo.trackNavigation(['form']);
      }

      const isBackgroundFetch = !changePage;

      if (action === ButtonAction.BTN_PROGRESS) {
        if (changePage) {
          this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), false, updateLocation);
        }
        this.submitDatasetProgress(isBackgroundFetch);
      } else {
        if (changePage) {
          this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_DATASET), false, updateLocation);
        }
        this.submitDatasetProblemPatterns(isBackgroundFetch);
        this.submitDatasetProgress(true);
      }
    }
    this.changeDetector.markForCheck();
  }

  /**
   * submitRecordProblemPatterns
   * Submits the formRecord data (problem patterns)
   **/
  public submitRecordProblemPatterns(): void {
    queueMicrotask(() => {
      this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
        isBusy: true,
        isPolling: false
      });

      this.subs.push(
        this.sandbox
          .getProblemPatternsRecordWrapped(this.trackDatasetId(), this.trackRecordId())
          .subscribe({
            next: (problemPatternsRecord: ProblemPatternsRecord) => {
              this.problemPatternsRecord.set(problemPatternsRecord);
              this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_RECORD, {
                error: undefined,
                isBusy: false,
                isPolling: false,
                lastLoadedIdDataset: this.trackDatasetId(),
                lastLoadedIdRecord: decodeURIComponent(this.trackRecordId())
              });

              // Cleanly lower flags on the adjacent background progress tracking layer
              this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
                isBusy: false,
                isPolling: false
              });
              this.changeDetector.markForCheck();
            },
            error: (err: HttpErrorResponse) => {
              this.problemPatternsRecord.set(undefined);
              this.sandboxConf.updateStepStatus(SandboxPageType.PROBLEMS_RECORD, {
                error: err,
                isBusy: false,
                isPolling: false,
                lastLoadedIdDataset: undefined,
                lastLoadedIdRecord: undefined
              });
              // Cleanly tear down the adjacent background progress tracking step indicators safely
              this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
                isBusy: false,
                isPolling: false
              });

              this.changeDetector.markForCheck();
              return err;
            }
          })
      );
    });
  }

  /**
   * submitRecordReport
   * Submits the formRecord data
   **/
  submitRecordReport(showMeta = false): void {
    this.sandboxConf.updateStepStatus(SandboxPageType.REPORT, { isBusy: true, isPolling: true });
    this.subs.push(
      this.sandbox.getRecordReport(this.trackDatasetId(), this.trackRecordId()).subscribe({
        next: (report: RecordReport) => {
          this.recordReport.set(report);
          this.sandboxConf.updateStepStatus(SandboxPageType.REPORT, {
            isBusy: false,
            isPolling: false,
            error: undefined,
            lastLoadedIdDataset: this.trackDatasetId(),
            lastLoadedIdRecord: decodeURIComponent(this.trackRecordId())
          });

          if (showMeta) {
            this.changeDetector.detectChanges();
            this.reportComponent()?.setView(DisplayedTier.METADATA);
            this.changeDetector.markForCheck();
          }
        },
        error: (err: HttpErrorResponse): void => {
          this.recordReport.set(undefined);
          this.sandboxConf.updateStepStatus(SandboxPageType.REPORT, {
            error: err,
            isBusy: false,
            isPolling: false,
            lastLoadedIdDataset: undefined,
            lastLoadedIdRecord: undefined
          });
          this.sandboxConf.updateStepStatus(SandboxPageType.PROGRESS_TRACK, {
            isPolling: false
          });
        }
      })
    );
  }

  /**
   * onSubmitRecord
   * Submits the formRecord data if valid, optionally calls updateLocation
   *
   * @param { ButtonAction } action - the desired action
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   * @param { boolean } showMeta - flag if showng metadata
   * @param { boolean } programmaticClick - flag if click is user-invoked or programmatic
   **/
  onSubmitRecord(
    action: ButtonAction,
    updateLocation = false,
    showMeta = false,
    programmaticClick = false,
    changePage = updateLocation
  ): void {
    const form = this.formRecord;

    if (form.valid) {
      this.trackRecordId.set(encodeURIComponent(form.controls.recordToTrack.value));
      this.trackDatasetId.set(this.formProgress.controls.datasetToTrack.value);

      // keep layout and navigation deferrals wrapped inside the macro frames safely
      queueMicrotask(() => {
        if (updateLocation && !programmaticClick) {
          this.matomo.trackNavigation(['form']);
        }

        if (action === ButtonAction.BTN_RECORD) {
          this.submitRecordReport(showMeta);
          if (changePage) {
            this.setPage(this.getStepIndex(SandboxPageType.REPORT));
          }
        } else {
          this.submitRecordProblemPatterns();

          if (changePage) {
            this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_RECORD));
          }
        }
      });
    }
  }

  /**
   * goToLocation
   * avoid pushing duplicate states to history
   * sets location url to the supplied path if it is different to that currently set
   *
   * @param { string } path - the url path
   * @returns void
   **/
  goToLocation(path: string): void {
    if (this.location.path() !== path) {
      this.location.go(path);
      this.matomo.urlChanged(path, this.sandboxNavConf()[this.currentStepIndex()].stepTitle);
    }
  }

  /**
   * updateLocation
   * routing utility to build location path
   * an call goToLocation()
   *
   * @param { true } datasetSegment - flag to include the dataset segment
   * @param { true } recordSegment - flag to include the record segment
   * @param { false } problemView - flag to include the view problems parameter
   * @returns boolean
   **/
  updateLocation(datasetSegment = true, recordSegment = true, problemView = false): void {
    let newPath = '';
    if (datasetSegment && this.trackDatasetId().length) {
      newPath += `/dataset/${this.trackDatasetId()}`;
      if (recordSegment && this.trackRecordId()) {
        newPath += `?recordId=${this.trackRecordId()}`;
        if (problemView) {
          newPath += `&view=problems`;
        }
      } else if (problemView) {
        newPath += `?view=problems`;
      }
    } else if (datasetSegment) {
      newPath += `/dataset`;
    }
    this.goToLocation(newPath);
  }

  /**
   * dataUploaded
   * invoked when the upload form has been submitted
   *
   * @param { string } datasetId - the datset id
   **/
  dataUploaded(datasetId: string): void {
    this.matomo.trackNavigation(['form']);
    this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { isBusy: false });
    this.sandboxConf.updateStepStatus(SandboxPageType.REPORT, { isBusy: false, isPolling: false });
    this.trackDatasetId.set(datasetId);
    this.userDataService.prependUserDatset(datasetId);
    this.fillAndSubmitProgressForm(false);
  }

  /**
   * openDataset
   * Overrides input tree values cleanly right before executing the core
   * processing pipeline to prevent asynchronous validation dropouts.
   * @param { string } datasetId - the clicked recent item identifier
   **/
  openDataset(datasetId: string): void {
    this.trackDatasetId.set(datasetId);
    this.fillAndSubmitProgressForm(false);
  }

  /**
   * defaultInputsShown
   *
   * Template utility to determine default input visibilty
   *
   * @returns boolean
   **/
  defaultInputsShown(): boolean {
    return ![
      SandboxPageType.HOME,
      SandboxPageType.PRIVACY_STATEMENT,
      SandboxPageType.COOKIE_POLICY,
      SandboxPageType.UPLOAD
    ].includes(this.currentStepType());
  }

  /**
   * fnSubmitProgress
   *
   * wrapper to force-close any open drop-in, re-enabling
   * validation prior to submitting
   **/
  fnSubmitProgress(): void {
    this.onSubmitProgress(ButtonAction.BTN_PROGRESS, true);
    this.changeDetector.detectChanges();
  }

  /**
   * fnSubmitProblems
   *
   * wrapper to force-close any open drop-in, re-enabling
   * validation prior to submitting
   **/
  fnSubmitProblems(): void {
    this.onSubmitProgress(ButtonAction.BTN_PROBLEMS, true);
    this.changeDetector.detectChanges();
  }

  /**
   * fillAndSubmitProgressForm
   * sets the datasetToTrack value in the progress form
   * submits the progress form (flags to update window location)
   * sets currentStepIndex to track the progress
   *
   * @param { false } problems - flag if loading progress data or problem-patterns
   * @param { true } updateLocation - flag onSubmitProgress to update url location
   **/
  fillAndSubmitProgressForm(
    problems = false,
    updateLocation = true,
    changePage = updateLocation
  ): void {
    // 1. Assign the text value to the input control field
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId(), { emitEvent: false });

    // 🚀 THE FIX: Force the form group to recalculate its validation status immediately!
    this.formProgress.controls.datasetToTrack.updateValueAndValidity({ emitEvent: false });
    this.formProgress.updateValueAndValidity({ emitEvent: false });

    const step: SandboxPageType = problems
      ? SandboxPageType.PROBLEMS_DATASET
      : SandboxPageType.PROGRESS_TRACK;

    if (changePage) {
      this.currentStepType.set(step);
      this.isMiniNav = false;
    }

    // Shield against PENDING verification delays using microtask scheduling
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.onSubmitProgress(
        problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_PROGRESS,
        updateLocation,
        true,
        changePage
      );
    });
  }

  /**
   * fillAndSubmitRecordForm
   * sets the form values
   * sets currentStepIndex to the report
   * submits the record form
   * @param { boolean } problems - flag to load report or problem-patterns
   * @param { true } updateLocation - flag to update url location
   **/
  fillAndSubmitRecordForm(
    problems: boolean,
    updateLocation = true,
    showMeta = false,
    changePage = updateLocation
  ): void {
    // 1. Assign the text values to both input control fields
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId() ?? '');
    this.formRecord.controls.recordToTrack.setValue(this.trackRecordId() ?? '');

    // 🚀 THE FIX: Force both form structures to recalculate validity states synchronously
    this.formProgress.controls.datasetToTrack.updateValueAndValidity({ emitEvent: false });
    this.formProgress.updateValueAndValidity({ emitEvent: false });

    this.formRecord.controls.recordToTrack.updateValueAndValidity({ emitEvent: false });
    this.formRecord.updateValueAndValidity({ emitEvent: false });

    const step: SandboxPageType = problems
      ? SandboxPageType.PROBLEMS_RECORD
      : SandboxPageType.REPORT;

    if (changePage) {
      this.currentStepType.set(step);
    }

    // Shield against PENDING verification delays using microtask scheduling
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.onSubmitRecord(
        problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_RECORD,
        updateLocation,
        showMeta,
        true,
        changePage
      );
    });
  }

  /**
   * followProblemPatternLink
   * Handles click on (internal) link
   * @param { string } recordId - the record to open
   **/
  followProblemPatternLink(recordId: string): void {
    this.trackRecordId.set(recordId);
    this.matomo.trackNavigation(['link']);
    this.fillAndSubmitRecordForm(true);
  }

  /**
   * openReport
   * Handles click on (internal) record link
   * @param { RecordReportRequest } request - the record to open
   **/
  openReport(request: RecordReportRequest): void {
    this.trackRecordId.set(request.recordId);
    this.fillAndSubmitRecordForm(false, true, request.openMetadata);
  }

  /**
   * refreshRecords - wrapper for dropInRecords
   **/
  refreshRecords(): void {
    const rawId = this.trackDatasetId();
    // Only trigger the refresh loop if a numeric string ID is active
    if (rawId && /^\d+$/.test(rawId)) {
      this.dropInRecords.refreshRecords(Number.parseInt(rawId, 10));
    }
  }

  openDatasetTiers(id?: string): void {
    this.recordShortcutRequest.set(id);
    this.fillAndSubmitProgressForm();
  }

  /**
   * handleDatasetAction
   * Unified public template helper handling both data streaming and event triggers safely.
   * Leverages precise navigation configurations to prevent destructive cleanups on cold boots.
   */
  public handleDatasetAction(action: 'refresh' | 'pause'): void {
    switch (action) {
      case 'refresh':
        this.userDataService.refreshUserDatsetPoller();
        break;
      case 'pause': {
        const activePage = this.currentStepType();
        const isStaticCompliancePage =
          activePage === SandboxPageType.PRIVACY_STATEMENT ||
          activePage === SandboxPageType.COOKIE_POLICY;

        if (isStaticCompliancePage) {
          this.userDataService.cleanup();
        }
        break;
      }
    }
  }
}
