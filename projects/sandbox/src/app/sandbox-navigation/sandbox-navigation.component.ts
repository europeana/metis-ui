import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap, DataPollingComponent, ProtocolType } from 'shared';

import { apiSettings } from '../../environments/apisettings';
import {
  Dataset,
  DatasetStatus,
  DisplayedTier,
  FieldOption,
  FixedLengthArray,
  ProblemPatternsDataset,
  ProblemPatternsRecord,
  RecordReport,
  RecordReportRequest,
  SandboxPage,
  SandboxPageType
} from '../_models';

import { SandboxService } from '../_services';
import { ProblemViewerComponent } from '../problem-viewer';
import { RecordReportComponent } from '../record-report';
import { UploadComponent } from '../upload';

enum ButtonAction {
  BTN_PROBLEMS = 'BTN_PROBLEMS',
  BTN_PROGRESS = 'BTN_PROGRESS',
  BTN_RECORD = 'BTN_RECORD'
}

@Component({
  selector: 'sb-sandbox-navigation',
  templateUrl: './sandbox-navigation.component.html',
  styleUrls: ['/sandbox-navigation.component.scss']
})
export class SandboxNavigatonComponent extends DataPollingComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly sandbox = inject(SandboxService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);

  public ButtonAction = ButtonAction;
  public SandboxPageType = SandboxPageType;
  public apiSettings = apiSettings;

  @ViewChild(ProblemViewerComponent, { static: false }) problemViewerRecord: ProblemViewerComponent;
  @ViewChild(UploadComponent, { static: false }) uploadComponent: UploadComponent;
  @ViewChild(RecordReportComponent, { static: false }) reportComponent: RecordReportComponent;

  formProgress = this.formBuilder.group({
    datasetToTrack: ['', [Validators.required, this.validateDatasetId.bind(this)]]
  });

  formRecord = this.formBuilder.group({
    recordToTrack: ['', [Validators.required, this.validateRecordId.bind(this)]]
  });

  isPollingProgress = false;
  isPollingRecord = false;
  EnumProtocolType = ProtocolType;
  EnumSandboxPageType = SandboxPageType;
  progressData?: Dataset;
  recordReport?: RecordReport;
  problemPatternsDataset?: ProblemPatternsDataset;
  problemPatternsRecord?: ProblemPatternsRecord;
  trackDatasetId = '';
  trackRecordId = '';
  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  sandboxNavConf: FixedLengthArray<SandboxPage, 6> = [
    {
      stepType: SandboxPageType.HOME,
      isHidden: true
    },
    {
      stepType: SandboxPageType.UPLOAD,
      isHidden: true
    },
    {
      stepType: SandboxPageType.PROGRESS_TRACK,
      isHidden: true
    },
    {
      stepType: SandboxPageType.PROBLEMS_DATASET,
      isHidden: true
    },
    {
      stepType: SandboxPageType.REPORT,
      isHidden: true
    },
    {
      stepType: SandboxPageType.PROBLEMS_RECORD,
      isHidden: true
    }
  ];

  currentStepIndex = this.getStepIndex(SandboxPageType.HOME);
  currentStepType = SandboxPageType.HOME;

  constructor() {
    super();
    this.subs.push(
      this.sandbox.getCountries().subscribe({
        next: (countries: Array<FieldOption>) => {
          this.countryList = countries;
        }
      })
    );
    this.subs.push(
      this.sandbox.getLanguages().subscribe({
        next: (languages: Array<FieldOption>) => {
          this.languageList = languages;
        }
      })
    );
    this.resetPageData();
  }

  /**
   * getNavOrbConfigOuter
   *
   * configure the status orbs
   *
   * @param { number } i - the orb index
   * @returns ngClass-compatible Map
   **/
  getNavOrbConfigOuter(i: number): ClassMap {
    return {
      'home-orb-container': this.sandboxNavConf[i].stepType === SandboxPageType.HOME,
      hidden: this.sandboxNavConf[i].isHidden
    };
  }

  /**
   * getNavOrbConfigInner
   *
   * configure the status orbs
   *
   * @param { number } i - the orb index
   * @returns ngClass-compatible Map
   **/
  getNavOrbConfigInner(i: number): ClassMap {
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
      'indicator-orb': this.getStepIsIndicator(i),
      spinner: !!stepConf.isBusy,
      'indicate-polling':
        (this.isPollingProgress && isProgressTrack) || (this.isPollingRecord && isRecordTrack)
    };
  }

  /**
   * getNavOrbLinks
   * Template utility for configuring sb-nav-orbs
   * @returns Array<string>
   **/
  getNavOrbLinks(): Array<string> {
    return [
      '/',
      '/new',
      `/dataset/${this.trackDatasetId}`,
      `/dataset/${this.trackDatasetId}?view=problems`,
      `/dataset/${this.trackDatasetId}?recordId=${this.trackRecordId}`,
      `/dataset/${this.trackDatasetId}?recordId=${this.trackRecordId}&view=problems`
    ];
  }

  /**
   * ngOnInit
   * handle route parameter changes
   **/
  ngOnInit(): void {
    this.subs.push(
      combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams])
        .pipe(
          map((results) => {
            return {
              params: results[0],
              queryParams: results[1]
            };
          })
        )
        .subscribe({
          next: (combined) => {
            const params = combined.params;
            const queryParams = combined.queryParams;
            const preloadDatasetId = params.id;
            const preloadRecordId = queryParams.recordId;

            if (preloadDatasetId && preloadRecordId) {
              this.trackDatasetId = preloadDatasetId;
              this.trackRecordId = decodeURIComponent(preloadRecordId);

              if (queryParams.view === 'problems') {
                this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_RECORD), false, false);
                this.fillAndSubmitRecordForm(true, false);
              } else {
                this.setPage(this.getStepIndex(SandboxPageType.REPORT), false, false);
                this.fillAndSubmitRecordForm(false, false);
              }
            } else if (preloadDatasetId) {
              this.trackDatasetId = preloadDatasetId;
              if (queryParams.view === 'problems') {
                this.setPage(this.getStepIndex(SandboxPageType.PROBLEMS_DATASET), false, false);
                this.fillAndSubmitProgressForm(true, false);
              } else {
                this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), false, false);
                this.fillAndSubmitProgressForm(false, false);
              }
            } else if (/\/new$/.exec(window.location.toString())) {
              this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), false, false);
            } else {
              if (/\/dataset$/.exec(window.location.toString())) {
                this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), true, false);
              } else if (/\/new$/.exec(window.location.toString())) {
                this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), false, false);
              } else {
                this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
              }
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
      // clear the data, form data, pollers / set step to progress
      this.progressData = undefined;
      this.trackDatasetId = '';
      this.trackRecordId = '';
      this.resetPageData();
      this.clearDataPollers();
      this.formProgress.controls.datasetToTrack.setValue('');

      if (url === '/new') {
        this.setPage(this.getStepIndex(SandboxPageType.UPLOAD), true, false);
      } else if (url === '') {
        this.setPage(this.getStepIndex(SandboxPageType.HOME), false, false);
      } else {
        this.setPage(this.getStepIndex(SandboxPageType.PROGRESS_TRACK), true, false);
      }
    } else {
      this.trackDatasetId = ids[1];
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
      const matches = /[0-9]+/.exec(`${val}`);
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
      return this.uploadComponent.form;
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

    const valDataset = this.formProgress.value.datasetToTrack;
    const valRecord = this.formRecord.value.recordToTrack;

    const matchValDataset = step.lastLoadedIdDataset === valDataset;
    const matchValRecord = step.lastLoadedIdRecord === valRecord;
    const matchBoth = matchValDataset && matchValRecord;

    if (step.stepType === SandboxPageType.PROGRESS_TRACK) {
      return matchValDataset && !!this.progressData;
    } else if (step.stepType === SandboxPageType.REPORT) {
      return matchBoth && !!this.recordReport;
    } else if (step.stepType === SandboxPageType.PROBLEMS_DATASET) {
      return matchValDataset && !!this.problemPatternsDataset;
    } else if (step.stepType === SandboxPageType.PROBLEMS_RECORD) {
      return matchBoth && !!this.problemPatternsRecord;
    }
    return this.uploadComponent && this.uploadComponent.form && this.uploadComponent.form.disabled;
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
   * callSetPage
   * Template utility to filter out right click / ctrl click events
   * Conditionally calls this.setPage
   *
   * @param { event } event - the dome event
   * @param { number } stepIndex - the value to set
   * @param { boolean } reset - flag a reset
   **/
  callSetPage(event: KeyboardEvent, stepIndex: number, reset = false): void {
    if (!event.ctrlKey) {
      event.preventDefault();
      this.setPage(stepIndex, reset);
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
   **/
  setPage(stepIndex: number, reset = false, updateLocation = true): void {
    if (reset) {
      const form = this.getFormGroup(this.sandboxNavConf[stepIndex]);
      if (form && form.disabled) {
        form.enable();
        this.uploadComponent.rebuildForm();
      }
    }
    this.currentStepIndex = stepIndex;
    this.currentStepType = this.sandboxNavConf[stepIndex].stepType;
    this.sandboxNavConf[stepIndex].isHidden = false;

    // 'home' enables 2 entry-points
    if (this.currentStepType === SandboxPageType.HOME) {
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
      }
    }
  }

  /**
   * progressComplete
   * Template utility to determine if the progress is complete
   *
   **/
  progressComplete(): boolean {
    const data = this.progressData;
    if (data) {
      if ([DatasetStatus.COMPLETED, DatasetStatus.FAILED].includes(data.status)) {
        return true;
      }
    }
    return false;
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
    const confStep = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROBLEMS_DATASET)];
    confStep.isBusy = true;

    this.subs.push(
      this.sandbox.getProblemPatternsDataset(this.trackDatasetId).subscribe({
        next: (problemPatternsDataset: ProblemPatternsDataset) => {
          this.problemPatternsDataset = problemPatternsDataset;
          confStep.error = undefined;
          confStep.isBusy = false;
          confStep.lastLoadedIdDataset = this.trackDatasetId;
        },
        error: (err: HttpErrorResponse) => {
          this.problemPatternsDataset = undefined;
          confStep.error = err;
          confStep.lastLoadedIdDataset = undefined;
          confStep.isBusy = false;
          return err;
        }
      })
    );
  }

  /**
   * submitDatasetProgress
   * Submits the trackDatasetId
   **/
  submitDatasetProgress(): void {
    const fieldNamePortalPublish = 'portal-publish';
    const stepConf = this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)];
    stepConf.isBusy = true;
    this.isPollingProgress = true;
    this.clearDataPollers();
    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<Dataset> => {
        return this.sandbox.requestProgress(this.trackDatasetId).pipe(
          // temporary removal of back-end info
          map((dataset: Dataset) => {
            if (
              dataset[fieldNamePortalPublish] &&
              SandboxService.nullUrlStrings.includes(dataset[fieldNamePortalPublish])
            ) {
              delete dataset[fieldNamePortalPublish];
            }
            return dataset;
          })
        );
      },
      (prev: Dataset, curr: Dataset) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      },
      (progressInfo: Dataset) => {
        this.progressData = progressInfo;
        stepConf.lastLoadedIdDataset = this.trackDatasetId;
        stepConf.error = undefined;

        if (this.progressComplete()) {
          stepConf.isBusy = false;
          this.isPollingProgress = false;

          if (
            this.progressData.status === DatasetStatus.COMPLETED ||
            this.progressData.status === DatasetStatus.FAILED ||
            this.progressData[fieldNamePortalPublish]
          ) {
            this.clearDataPollers();
          }
        }
      },
      (err: HttpErrorResponse) => {
        this.progressData = undefined;
        stepConf.lastLoadedIdDataset = undefined;
        stepConf.error = err;
        stepConf.isBusy = false;
        this.isPollingProgress = false;
        return err;
      }
    );
  }

  /**
   * onSubmitProgress
   * Submits the formProgress data if valid
   *
   * @param { ButtonAction } action - the desired action
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   **/
  onSubmitProgress(action: ButtonAction, updateLocation = false): void {
    const form = this.formProgress;

    if (form.valid) {
      this.trackDatasetId = this.formProgress.controls.datasetToTrack.value;

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
        .getProblemPatternsRecordWrapped(this.trackDatasetId, this.trackRecordId)
        .subscribe({
          next: (problemPatternsRecord: ProblemPatternsRecord) => {
            this.problemPatternsRecord = problemPatternsRecord;
            stepConf.error = undefined;
            stepConf.isBusy = false;
            stepConf.lastLoadedIdDataset = this.trackDatasetId;
            stepConf.lastLoadedIdRecord = decodeURIComponent(this.trackRecordId);
            setTimeout(() => {
              this.problemViewerRecord.recordId = this.trackRecordId;
            });
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
    this.isPollingRecord = true;

    this.subs.push(
      this.sandbox.getRecordReport(this.trackDatasetId, this.trackRecordId).subscribe({
        next: (report: RecordReport) => {
          this.recordReport = report;
          stepConf.isBusy = false;
          this.isPollingRecord = false;
          stepConf.error = undefined;
          stepConf.lastLoadedIdDataset = this.trackDatasetId;
          stepConf.lastLoadedIdRecord = decodeURIComponent(this.trackRecordId);

          if (showMeta) {
            setTimeout(() => {
              this.reportComponent.setView(DisplayedTier.METADATA);
            }, 0);
          }
        },
        error: (err: HttpErrorResponse): void => {
          this.recordReport = undefined;
          stepConf.error = err;
          stepConf.lastLoadedIdDataset = undefined;
          stepConf.lastLoadedIdRecord = undefined;
          stepConf.isBusy = false;
          this.isPollingRecord = false;
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
   **/
  onSubmitRecord(action: ButtonAction, updateLocation = false, showMeta = false): void {
    const form = this.formRecord;

    if (form.valid) {
      this.trackRecordId = encodeURIComponent(this.formRecord.controls.recordToTrack.value);
      this.trackDatasetId = this.formProgress.controls.datasetToTrack.value;

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
    if (datasetSegment && this.trackDatasetId) {
      newPath += `/dataset/${this.trackDatasetId}`;
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
    this.setBusyUpload(false);
    this.sandboxNavConf[this.getStepIndex(SandboxPageType.PROGRESS_TRACK)].isBusy = false;
    this.isPollingProgress = false;
    this.trackDatasetId = datasetId;
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
    return ![SandboxPageType.HOME, SandboxPageType.UPLOAD].includes(this.currentStepType);
  }

  /**
   * fillAndSubmitProgressForm
   * sets the datasetToTrack value in the progress form
   * submits the progress form (flags to update window location)
   * sets currentStepIndex to track the progress
   *
   * @param { boolean } problems - flag if loading progress data or problem-patterns
   * @param { true } updateLocation - flag onSubmitProgress to update url location
   **/
  fillAndSubmitProgressForm(problems: boolean, updateLocation = true): void {
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId);

    let step: SandboxPageType;

    if (problems) {
      step = SandboxPageType.PROBLEMS_DATASET;
    } else {
      step = SandboxPageType.PROGRESS_TRACK;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);

    this.onSubmitProgress(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_PROGRESS,
      updateLocation
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
    this.formProgress.controls.datasetToTrack.setValue(this.trackDatasetId ?? '');
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
      showMeta
    );
  }

  /**
   * followProblemPatternLink
   * Handles click on (internal) link
   * @param { string } recordId - the record to open
   **/
  followProblemPatternLink(recordId: string): void {
    this.trackRecordId = recordId;
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
}
