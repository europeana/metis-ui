import { Location, NgClass, NgFor, NgIf, NgStyle, PopStateEvent } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
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
import { combineLatest, Observable, switchMap, of } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

import { map } from 'rxjs/operators';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { ClassMap, DataPollingComponent, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';

import { dropInConfDatasets, dropInConfRecords } from '../_data';

import {
  DatasetProgress,
  DatasetStatus,
  DisplayedTier,
  FixedLengthArray,
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
    NgFor,
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
  private readonly sandboxConf = inject(SandboxConfService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly changeDetector: ChangeDetectorRef = inject(ChangeDetectorRef);

  readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  public readonly userDataService = inject(UserDataService);
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
  readonly dropInDatasetId = viewChild(DropInComponent);

  // Template references (ElementRef)
  readonly datasetToTrack = viewChild<ElementRef>('datasetToTrack');
  readonly recordToTrack = viewChild<ElementRef>('recordToTrack');

  // Top-level signals
  isAuthenticated = computed(() => {
    const event = this.keycloakSignal();
    // Check for Ready/Success types, or fallback to the instance check
    return event.type === KeycloakEventType.Ready || this.keycloak.authenticated;
  });

  formProgress = this.formBuilder.group({
    datasetToTrack: ['', [Validators.required, this.validateDatasetId.bind(this)]]
  });

  formRecord = this.formBuilder.group({
    recordToTrack: ['', [Validators.required, this.validateRecordId.bind(this)]]
  });

  isMiniNav = false;
  EnumProtocolType = ProtocolType;
  EnumSandboxPageType = SandboxPageType;
  progressRegistry: { [key: string]: DatasetProgress } = {};
  datasetProblemsRegistry: { [key: string]: ProblemPatternsDataset } = {};
  recordReport?: RecordReport;
  problemPatternsDataset?: ProblemPatternsDataset;
  problemPatternsRecord?: ProblemPatternsRecord;

  // TODO!
  trackRecordId = '';

  readonly trackDatasetId = signal('');

  readonly progressData = signal<DatasetProgress | undefined>(undefined);

  readonly datasetInfo = toSignal(
    toObservable(this.trackDatasetId).pipe(
      switchMap((id) => (id ? this.sandbox.getDatasetInfo(id) : of(undefined)))
    )
  );

  sandboxNavConf: FixedLengthArray<SandboxPage, 8>;
  currentStepIndex: number;
  currentStepType: SandboxPageType;
  tooltips: Array<string>;
  recordShortcutRequest?: string;

  constructor() {
    super();
    this.sandboxNavConf = this.sandboxConf.getConf();
    this.tooltips = this.sandboxNavConf.map((item) => item.stepTitle.toLowerCase());
    this.currentStepIndex = this.getStepIndex(SandboxPageType.HOME);
    this.currentStepType = SandboxPageType.HOME;
    this.resetPageData();
  }

  /**
   * clearError
   *
   * reset the step error
   **/
  clearError(): void {
    this.sandboxNavConf[this.currentStepIndex].error = undefined;
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

  /**
   * getNavOrbConfigOuter
   *
   * configure the status orbs
   *
   * @param { number } i - the orb index
   * @returns ngClass-compatible Map
   **/
  readonly getNavOrbConfigOuter = (i: number): ClassMap => {
    return {
      'home-orb-container': this.sandboxNavConf[i].stepType === SandboxPageType.HOME,
      hidden: this.sandboxNavConf[i].isHidden
    };
  };

  /**
   * getNavOrbConfigInner
   *
   * configure the status orbs
   *
   * @param { number } i - the orb index
   * @returns ngClass-compatible Map
   **/
  readonly getNavOrbConfigInner = (i: number): ClassMap => {
    const stepConf = this.sandboxNavConf[i];
    const isProblemOrb = [
      SandboxPageType.PROBLEMS_DATASET,
      SandboxPageType.PROBLEMS_RECORD
    ].includes(stepConf.stepType);
    const isProgressTrack = stepConf.stepType === SandboxPageType.PROGRESS_TRACK;
    const isRecordTrack = stepConf.stepType === SandboxPageType.REPORT;
    const isUpload = this.getIsUpload(i);

    return {
      'is-active': this.currentStepType === stepConf.stepType,
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
  };

  /**
   * getNavOrbLinks
   * Template utility for configuring sb-nav-orbs
   * @returns Array<string>
   **/
  getNavOrbLinks(): Array<string> {
    return [
      '/',
      '/new',
      `/dataset/${this.trackDatasetId()}`,
      `/dataset/${this.trackDatasetId()}?view=problems`,
      `/dataset/${this.trackDatasetId()}?recordId=${this.trackRecordId}`,
      `/dataset/${this.trackDatasetId()}?recordId=${this.trackRecordId}&view=problems`
    ];
  }

  pushInputsForDropIn = signal(0);

  dropInPush(e: number): void {
    this.pushInputsForDropIn.set(e);
  }

  ngOnInit(): void {
    this.subs.push(
      combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
        .pipe(map(([params, queryParams]) => ({ params, queryParams })))
        .subscribe({
          next: (combined) => {
            const path = this.location.path();
            const preloadDatasetId = combined.params.id;
            const preloadRecordId = combined.queryParams.recordId;
            const problemsView = combined.queryParams.view === 'problems';

            // 1. Initialize variables with defaults to satisfy TypeScript
            let fnFillForm: (_isDataset: boolean, _isRecord: boolean) => void = () => {};
            let stepTypes: { primary: SandboxPageType; secondary: SandboxPageType };

            // 2. Drive the reactive Signal
            this.trackDatasetId.set(preloadDatasetId || '');

            // 3. Determine the Page Logic and Form function
            if (preloadDatasetId) {
              // Case: Loading a specific Dataset
              if (this.progressRegistry[preloadDatasetId]) {
                this.progressData.set(this.progressRegistry[preloadDatasetId]);
              } else {
                this.fillAndSubmitProgressForm(preloadDatasetId);
                //        this.createNewDatasetPoller(preloadDatasetId);
              }
              fnFillForm = this.fillAndSubmitProgressForm.bind(this);
              stepTypes = {
                primary: SandboxPageType.PROBLEMS_DATASET,
                secondary: SandboxPageType.PROGRESS_TRACK
              };
            } else if (preloadRecordId) {
              // Case: Loading a specific Record
              this.trackRecordId = decodeURIComponent(preloadRecordId);
              fnFillForm = this.fillAndSubmitRecordForm.bind(this);
              stepTypes = {
                primary: SandboxPageType.PROBLEMS_RECORD,
                secondary: SandboxPageType.REPORT
              };
            } else {
              // Default Case: Home or Empty Progress
              fnFillForm = this.fillAndSubmitProgressForm.bind(this);
              stepTypes = {
                primary: SandboxPageType.PROBLEMS_DATASET,
                secondary: SandboxPageType.PROGRESS_TRACK
              };
            }

            // 4. Navigation & Form Execution
            if (/\/new$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), false, false);
            } else if (/privacy-statement$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.PRIVACY_STATEMENT), false, false);
            } else if (/cookie-policy$/.exec(path)) {
              this.setPage(this.getStepIndex(SandboxPageType.COOKIE_POLICY), false, false);
            } else if (preloadDatasetId || preloadRecordId) {
              // Use the determined stepTypes to find the correct index
              const targetType = problemsView ? stepTypes.primary : stepTypes.secondary;
              this.setPage(this.getStepIndex(targetType), false, false);

              // Execute the form filling (isDataset, isRecord)
              fnFillForm(problemsView, !problemsView && !!preloadRecordId);
            } else {
              this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
            }
          }
        })
    );
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
      if (['/dataset'].includes(url)) {
        // clear the data
        this.trackDatasetId.set('');
        this.trackRecordId = '';
        this.formProgress.controls.datasetToTrack.setValue('');
      }

      // reset error and busy flags
      this.resetPageData();
      this.clearDataPollers();

      if (url === '/new') {
        this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), true, false);
      } else if (url === '') {
        this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
      } else if (url === '/privacy-statement') {
        this.setPage(this.getStepIndex(SandboxPageType.PRIVACY_STATEMENT), false, false);
      } else if (url === '/cookie-policy') {
        this.setPage(this.getStepIndex(SandboxPageType.COOKIE_POLICY), false, false);
      } else {
        this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), true, false);
      }
    } else {
      this.trackDatasetId.set(ids[1]);
      const regParamRecord = /\S+\?recordId=([^&]*)/;
      const regParamProblems = /[?&]view=problems/;
      const matchParamRecord: RegExpMatchArray | null = regParamRecord.exec(url);
      const matchParamProblems = !!regParamProblems.exec(url);
      if (matchParamRecord) {
        this.trackRecordId = decodeURIComponent(matchParamRecord[1]);
        this.fillAndSubmitRecordForm(matchParamProblems);
      } else {
        this.formRecord.controls.recordToTrack.setValue('');
        this.fillAndSubmitProgressForm(matchParamProblems, false);
      }
    }
  }

  /**
   * resetPageData
   * reset variables in the sandboxNavConf object
   **/
  resetPageData(): void {
    this.sandboxNavConf.forEach((step: SandboxPage) => {
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
    return this.sandboxNavConf.findIndex((step: SandboxPage) => {
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
    const step = this.sandboxNavConf[stepIndex];

    if (step.stepType === SandboxPageType.UPLOAD) {
      return !this.isAuthenticated();
    }

    const valDataset = this.formProgress.value.datasetToTrack;
    const valRecord = this.formRecord.value.recordToTrack;

    const matchValDataset = step.lastLoadedIdDataset === valDataset;
    const matchValRecord = step.lastLoadedIdRecord === valRecord;
    const matchBoth = matchValDataset && matchValRecord;

    if (step.stepType === SandboxPageType.PROGRESS_TRACK) {
      return matchValDataset && !!this.progressData();
    } else if (step.stepType === SandboxPageType.REPORT) {
      return matchBoth && !!this.recordReport;
    } else if (step.stepType === SandboxPageType.PROBLEMS_DATASET) {
      return matchValDataset && !!this.problemPatternsDataset;
    } else if (step.stepType === SandboxPageType.PROBLEMS_RECORD) {
      return matchBoth && !!this.problemPatternsRecord;
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
      this.sandboxNavConf[stepIndex].stepType
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
    return this.sandboxNavConf[stepIndex].stepType === SandboxPageType.UPLOAD;
  }

  /**
   * showAllRecent
   * allow home page to open the drop in
   **/
  showAllRecent(): void {
    this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), false, true);
    this.changeDetector.detectChanges();
    this.dropInDatasetId()?.openPinnedAll(this.datasetToTrack()?.nativeElement);
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
      this.keycloak.login({ redirectUri: window.location.origin + '/new' });
      return;
    }
    if (reset) {
      const form = this.getFormGroup(this.sandboxNavConf[stepIndex]);
      if (form && form.disabled) {
        form.enable();
        this.uploadComponent()?.rebuildForm();
      }
    }

    if (!programmaticClick) {
      this.matomo.trackNavigation(['link', 'top-nav']);
    }
    const activeStep = this.sandboxNavConf[stepIndex];

    document.title = `Metis Sandbox: ${activeStep.stepTitle}`;

    this.currentStepIndex = stepIndex;
    this.currentStepType = activeStep.stepType;
    activeStep.isHidden = false;

    this.isMiniNav = [SandboxPageType.PRIVACY_STATEMENT, SandboxPageType.COOKIE_POLICY].includes(
      this.currentStepType
    );

    // static pages enable 2 entry-points on the dial
    if (
      [
        SandboxPageType.HOME,
        SandboxPageType.PRIVACY_STATEMENT,
        SandboxPageType.COOKIE_POLICY
      ].includes(this.currentStepType)
    ) {
      this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)].isHidden = false;
      this.sandboxNavConf[this.getStepIndex(SandboxPageType.UPLOAD)].isHidden = false;
    }

    if (updateLocation) {
      if (this.currentStepType === SandboxPageType.HOME) {
        this.goToLocation('');
      } else if (this.currentStepType === SandboxPageType.UPLOAD) {
        this.goToLocation('/new');
      } else if (this.currentStepType === SandboxPageType.PROGRESS_TRACK) {
        this.updateLocation(true, false);
      } else if (this.currentStepType === SandboxPageType.REPORT) {
        this.updateLocation(true, true, false);
      } else if (this.currentStepType === SandboxPageType.PROBLEMS_DATASET) {
        this.updateLocation(true, false, true);
      } else if (this.currentStepType === SandboxPageType.PROBLEMS_RECORD) {
        this.updateLocation(true, true, true);
      } else if (this.currentStepType === SandboxPageType.PRIVACY_STATEMENT) {
        this.goToLocation('/privacy-statement');
      } else if (this.currentStepType === SandboxPageType.COOKIE_POLICY) {
        this.goToLocation('/cookie-policy');
      }
    }
  }

  /**
   * progressComplete
   * Template utility to determine if the progress is complete
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

    const valDataset = this.formProgress.value.datasetToTrack;
    const valRecord = this.formRecord.value.recordToTrack;

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
   **/
  submitDatasetProblemPatterns(): void {
    const trackDatasetId = this.trackDatasetId();
    const pollerId = `${trackDatasetId}_problems`;

    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROBLEMS_DATASET)];
    stepConf.isBusy = true;
    stepConf.isPolling = true;

    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<ProblemPatternsDataset> => {
        return this.sandbox.getProblemPatternsDataset(trackDatasetId);
      },
      (prev: ProblemPatternsDataset, curr: ProblemPatternsDataset) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      },
      (problemPatternsDataset: ProblemPatternsDataset) => {
        this.datasetProblemsRegistry[trackDatasetId] = problemPatternsDataset;
        stepConf.error = undefined;
        stepConf.lastLoadedIdDataset = this.trackDatasetId();

        // only assign if id has not changed
        if (this.trackDatasetId() === trackDatasetId) {
          this.problemPatternsDataset = this.datasetProblemsRegistry[trackDatasetId];
        }
        if (ProblemPatternAnalysisStatus.FINALIZED === problemPatternsDataset.analysisStatus) {
          stepConf.isBusy = false;
          stepConf.isPolling = false;
          this.clearDataPollerByIdentifier(pollerId);
        }
      },
      (err: HttpErrorResponse) => {
        this.problemPatternsDataset = undefined;
        stepConf.error = err;
        stepConf.lastLoadedIdDataset = undefined;
        stepConf.isBusy = false;
        return err;
      },
      pollerId
    );

    // invoke progress load
    this.submitDatasetProgress(true);
  }

  /**
   * submitDatasetProgress
   * Submits the trackDatasetId
   * @param { boolean } inBackground - flags if UI should update
   **/
  submitDatasetProgress(inBackground = false): void {
    const fieldNamePortalPublish = 'portal-publish';
    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)];
    const datasetId = this.trackDatasetId();

    // get progress data from the registry
    if (this.progressRegistry[datasetId]) {
      const data = this.progressRegistry[datasetId];
      if (data) {
        this.trackDatasetId.set(datasetId);
      }

      if (!inBackground) {
        stepConf.lastLoadedIdDataset = datasetId;
        stepConf.error = undefined;
      }
      if (this.progressData() && this.progressComplete(this.progressData()!)) {
        stepConf.isBusy = false;
        stepConf.isPolling = false;
        return;
      }
    }

    if (!inBackground) {
      stepConf.isBusy = true;
      stepConf.isPolling = true;
    }

    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<DatasetProgress> => {
        return this.sandbox.requestProgress(datasetId).pipe(
          // temporary removal of back-end info
          map((progressData: DatasetProgress) => {
            if (
              progressData[fieldNamePortalPublish] &&
              SandboxService.nullUrlStrings.includes(progressData[fieldNamePortalPublish])
            ) {
              delete progressData[fieldNamePortalPublish];
            }
            return progressData;
          })
        );
      },
      (prev: DatasetProgress, curr: DatasetProgress) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      },
      (progressInfo: DatasetProgress) => {
        this.progressRegistry[datasetId] = progressInfo;

        // Update the signal if this is the dataset we are currently looking at
        if (!inBackground && this.trackDatasetId() === datasetId) {
          this.progressData.set(progressInfo); // Push to the UI
        }

        if (!inBackground) {
          stepConf.lastLoadedIdDataset = datasetId;
          stepConf.error = undefined;
        }

        if (this.progressComplete(progressInfo)) {
          if (!inBackground) {
            stepConf.isBusy = false;
            stepConf.isPolling = false;
          }
          // Logic to stop polling
          if (
            progressInfo.status === DatasetStatus.COMPLETED ||
            progressInfo[fieldNamePortalPublish]
          ) {
            this.clearDataPollerByIdentifier(datasetId);
          }
        }
      },
      (err: HttpErrorResponse) => {
        if (!inBackground) {
          this.trackDatasetId.set('');
          stepConf.lastLoadedIdDataset = undefined;
          stepConf.error = err;
          stepConf.isBusy = false;
          stepConf.isPolling = false;
        }
        return err;
      },
      datasetId
    );
  }

  /**
   * onSubmitProgress
   * Submits the formProgress data if valid
   *
   * @param { ButtonAction } action - the desired action
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   * @param { boolean } programmaticClick - flag if click is user-invoked or programmatic
   **/
  onSubmitProgress(action: ButtonAction, updateLocation = false, programmaticClick = false): void {
    const form = this.formProgress;

    if (form.valid) {
      this.trackDatasetId.set(this.formProgress.controls.datasetToTrack.value);

      // track the click event if navigating (ahead of the subsequently-invoked pageView track)
      if (updateLocation && !programmaticClick) {
        this.matomo.trackNavigation(['form']);
      }

      if (action === ButtonAction.BTN_PROGRESS) {
        if (updateLocation) {
          this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK));
        }
        this.submitDatasetProgress();
      } else {
        if (updateLocation) {
          this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_DATASET));
        }
        this.submitDatasetProblemPatterns();
      }
    }
  }

  /**
   * submitRecordProblemPatterns
   * Submits the formRecord data (problem patterns)
   **/
  submitRecordProblemPatterns(): void {
    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROBLEMS_RECORD)];
    stepConf.isBusy = true;
    this.subs.push(
      this.sandbox
        .getProblemPatternsRecordWrapped(this.trackDatasetId(), this.trackRecordId)
        .subscribe({
          next: (problemPatternsRecord: ProblemPatternsRecord) => {
            this.problemPatternsRecord = problemPatternsRecord;
            stepConf.error = undefined;
            stepConf.isBusy = false;
            stepConf.lastLoadedIdDataset = this.trackDatasetId();
            stepConf.lastLoadedIdRecord = decodeURIComponent(this.trackRecordId);
            if (!this.problemViewerRecord()) {
              this.changeDetector.detectChanges();
            }
          },
          error: (err: HttpErrorResponse) => {
            this.problemPatternsRecord = undefined;
            stepConf.error = err;
            stepConf.lastLoadedIdDataset = undefined;
            stepConf.lastLoadedIdRecord = undefined;
            stepConf.isBusy = false;
            return err;
          }
        })
    );
  }

  /**
   * submitRecordReport
   * Submits the formRecord data
   **/
  submitRecordReport(showMeta = false): void {
    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.REPORT)];
    stepConf.isBusy = true;
    stepConf.isPolling = true;

    this.subs.push(
      this.sandbox.getRecordReport(this.trackDatasetId(), this.trackRecordId).subscribe({
        next: (report: RecordReport) => {
          this.recordReport = report;
          stepConf.isBusy = false;
          stepConf.isPolling = false;
          stepConf.error = undefined;
          stepConf.lastLoadedIdDataset = this.trackDatasetId();
          stepConf.lastLoadedIdRecord = decodeURIComponent(this.trackRecordId);

          if (showMeta) {
            this.changeDetector.detectChanges();
            this.reportComponent()?.setView(DisplayedTier.METADATA);
          }
        },
        error: (err: HttpErrorResponse): void => {
          this.recordReport = undefined;
          stepConf.error = err;
          stepConf.lastLoadedIdDataset = undefined;
          stepConf.lastLoadedIdRecord = undefined;
          stepConf.isBusy = false;
          stepConf.isPolling = false;
          this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)].isPolling = false;
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
    programmaticClick = false
  ): void {
    const form = this.formRecord;

    if (form.valid) {
      this.trackRecordId = encodeURIComponent(this.formRecord.controls.recordToTrack.value);
      this.trackDatasetId.set(this.formProgress.controls.datasetToTrack.value);

      // track the click event if navigating (ahead of the subsequently-invoked pageView track)
      if (updateLocation && !programmaticClick) {
        this.matomo.trackNavigation(['form']);
      }

      if (action === ButtonAction.BTN_RECORD) {
        this.submitRecordReport(showMeta);
        if (updateLocation) {
          this.setPage(this.getStepIndex(SandboxPageType.REPORT));
        }
      } else {
        this.submitRecordProblemPatterns();
        if (updateLocation) {
          this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_RECORD));
        }
      }
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
      this.matomo.urlChanged(path, this.sandboxNavConf[this.currentStepIndex].stepTitle);
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
      if (recordSegment && this.trackRecordId) {
        newPath += `?recordId=${this.trackRecordId}`;
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
   * setBusyUpload
   * sets the "busy" flag in sandboxNavConf
   *
   * @param { boolean } isBusy - the value to set
   **/
  setBusyUpload(isBusy: boolean): void {
    this.sandboxNavConf[this.getStepIndex(SandboxPageType.UPLOAD)].isBusy = isBusy;
  }

  /**
   * dataUploaded
   * invoked when the upload form has been submitted
   *
   * @param { string } datasetId - the datset id
   **/
  dataUploaded(datasetId: string): void {
    this.matomo.trackNavigation(['form']);

    this.setBusyUpload(false);

    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)];
    stepConf.isBusy = false;
    stepConf.isPolling = false;
    this.trackDatasetId.set(datasetId);
    this.userDataService.prependUserDatset(datasetId);
    this.fillAndSubmitProgressForm(false);
  }

  /**
   * openDataset
   *
   * sets and submits the dataset id
   * @param { string } datasetId - the datset id
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
    ].includes(this.currentStepType);
  }

  /**
   * fnSubmitProgress
   *
   * wrapper to force-close any open drop-in, re-enabling
   * validation prior to submitting
   **/
  fnSubmitProgress(): void {
    this.changeDetector.detectChanges();
    this.onSubmitProgress(ButtonAction.BTN_PROGRESS, true);
  }

  /**
   * fnSubmitProblems
   *
   * wrapper to force-close any open drop-in, re-enabling
   * validation prior to submitting
   **/
  fnSubmitProblems(): void {
    this.changeDetector.detectChanges();
    this.onSubmitProgress(ButtonAction.BTN_PROBLEMS, true);
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
  fillAndSubmitProgressForm(problems = false, updateLocation = true): void {
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId());

    let step: SandboxPageType;

    if (problems) {
      step = SandboxPageType.PROBLEMS_DATASET;
    } else {
      step = SandboxPageType.PROGRESS_TRACK;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);
    this.isMiniNav = false;

    this.onSubmitProgress(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_PROGRESS,
      updateLocation,
      true
    );
  }

  /**
   * fillAndSubmitRecordForm
   * sets the form values
   * sets currentStepIndex to the report
   * submits the record form
   * @param { boolean } problems - flag to load report or problem-patterns
   * @param { true } updateLocation - flag to update url location
   **/
  fillAndSubmitRecordForm(problems: boolean, updateLocation = true, showMeta = false): void {
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId() ?? '');
    this.formRecord.controls.recordToTrack.setValue(this.trackRecordId ?? '');

    let step: SandboxPageType;

    if (problems) {
      step = SandboxPageType.PROBLEMS_RECORD;
    } else {
      step = SandboxPageType.REPORT;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);
    this.onSubmitRecord(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_RECORD,
      updateLocation,
      showMeta,
      true
    );
  }

  /**
   * followProblemPatternLink
   * Handles click on (internal) link
   * @param { string } recordId - the record to open
   **/
  followProblemPatternLink(recordId: string): void {
    this.trackRecordId = recordId;
    this.matomo.trackNavigation(['link']);
    this.fillAndSubmitRecordForm(true);
  }

  /**
   * openReport
   * Handles click on (internal) record link
   * @param { RecordReportRequest } request - the record to open
   **/
  openReport(request: RecordReportRequest): void {
    this.trackRecordId = request.recordId;
    this.fillAndSubmitRecordForm(false, true, request.openMetadata);
  }

  /**
   * refreshRecords - wrapper for dropInRecords
   **/
  refreshRecords(): void {
    this.dropInRecords.refreshRecords(Number.parseInt(this.trackDatasetId()));
  }

  openDatasetTiers(id?: string): void {
    this.recordShortcutRequest = id;
    this.fillAndSubmitProgressForm();
  }
}
