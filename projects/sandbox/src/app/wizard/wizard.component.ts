import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClassMap,
  DataPollingComponent,
  FileUploadComponent,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';

import { apiSettings } from '../../environments/apisettings';
import {
  Dataset,
  DatasetStatus,
  FieldOption,
  FixedLengthArray,
  ProblemPattern,
  ProblemPatternsDataset,
  RecordReport,
  WizardStep,
  WizardStepType
} from '../_models';
import { SandboxService } from '../_services';
import { UploadComponent } from '../upload';

enum ButtonAction {
  BTN_PROBLEMS = 'BTN_PROBLEMS',
  BTN_PROGRESS = 'BTN_PROGRESS',
  BTN_RECORD = 'BTN_RECORD'
}

@Component({
  selector: 'sb-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent extends DataPollingComponent implements OnInit {
  public ButtonAction = ButtonAction;

  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;
  @ViewChild(UploadComponent, { static: false }) uploadComponent: UploadComponent;

  formProgress: FormGroup;
  formRecord: FormGroup;
  isPollingProgress = false;
  isPollingRecord = false;
  EnumProtocolType = ProtocolType;
  EnumWizardStepType = WizardStepType;
  progressData?: Dataset;
  recordReport?: RecordReport;
  problemPatternsDataset?: ProblemPatternsDataset;
  problemPatternsRecord?: Array<ProblemPattern>;
  trackDatasetId?: string;
  trackRecordId?: string;
  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  wizardConf: FixedLengthArray<WizardStep, 5> = [
    {
      stepType: WizardStepType.UPLOAD,
      fields: [
        'name',
        'country',
        'language',
        'uploadProtocol',
        'dataset',
        'url',
        'sendXSLT',
        'xsltFile',
        'harvestUrl',
        'setSpec',
        'metadataFormat'
      ],
      isHidden: true
    },
    {
      stepType: WizardStepType.PROGRESS_TRACK,
      fields: ['datasetToTrack'],
      isHidden: true
    },
    {
      stepType: WizardStepType.PROBLEMS_DATASET,
      fields: [],
      isHidden: true
    },
    {
      stepType: WizardStepType.REPORT,
      fields: ['recordToTrack'],
      isHidden: true
    },
    {
      stepType: WizardStepType.PROBLEMS_RECORD,
      fields: [],
      isHidden: true
    }
  ];

  currentStepIndex = this.getStepIndex(WizardStepType.PROGRESS_TRACK);
  currentStepType = WizardStepType.PROGRESS_TRACK;

  constructor(
    private readonly fb: FormBuilder,
    private readonly sandbox: SandboxService,
    private readonly route: ActivatedRoute,
    private readonly location: Location
  ) {
    super();
    this.subs.push(
      this.sandbox.getCountries().subscribe((countries: Array<FieldOption>) => {
        this.countryList = countries;
      })
    );
    this.subs.push(
      this.sandbox.getLanguages().subscribe((languages: Array<FieldOption>) => {
        this.languageList = languages;
      })
    );
    this.buildForms();
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
    const isProblem = this.getIsProblem(i);
    return {
      'progress-orb-container': this.wizardConf[i].stepType === WizardStepType.PROGRESS_TRACK,
      'problem-orb-container': isProblem,
      'report-orb-container': this.wizardConf[i].stepType === WizardStepType.REPORT,
      hidden: this.wizardConf[i].isHidden
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
    const isProblemOrb = [
      this.getStepIndex(WizardStepType.PROBLEMS_DATASET),
      this.getStepIndex(WizardStepType.PROBLEMS_RECORD)
    ].includes(i);
    const isProgressTrack = this.wizardConf[i].stepType === WizardStepType.PROGRESS_TRACK;
    const isRecordTrack = this.wizardConf[i].stepType === WizardStepType.REPORT;
    const isUpload = this.getIsUpload(i);
    const isLoading = !!this.wizardConf[i].isBusy;
    const stepConf = this.wizardConf[i];

    return {
      'is-active': this.currentStepType === stepConf.stepType,
      'problem-orb': isProblemOrb,
      'progress-orb': isProgressTrack,
      'report-orb': isRecordTrack,
      'upload-orb': isUpload,
      'indicator-orb': this.getStepIsIndicator(i),
      spinner: isLoading,
      'indicate-polling':
        (this.isPollingProgress && isProgressTrack) || (this.isPollingRecord && isRecordTrack)
    };
  }

  /**
   * ngOnInit
   * handle route parameters
   **/
  ngOnInit(): void {
    this.subs.push(
      combineLatest([this.route.params, this.route.queryParams])
        .pipe(
          map((results) => {
            return {
              params: results[0],
              queryParams: results[1]
            };
          })
        )
        .subscribe((combined) => {
          const params = combined.params;
          const queryParams = combined.queryParams;
          const preloadDatasetId = params.id;
          const preloadRecordId = queryParams.recordId;

          if (preloadDatasetId && preloadRecordId) {
            this.trackDatasetId = preloadDatasetId;
            this.trackRecordId = decodeURIComponent(preloadRecordId);

            if (queryParams.view === 'problems') {
              this.fillAndSubmitRecordForm(true);
            } else {
              this.fillAndSubmitRecordForm(false);
            }
          } else if (preloadDatasetId) {
            this.trackDatasetId = preloadDatasetId;

            if (queryParams.view === 'problems') {
              this.fillAndSubmitProgressForm(true);
            } else {
              this.fillAndSubmitProgressForm(false);
            }
          } else if (window.location.toString().match(/\/new$/)) {
            this.setStep(this.getStepIndex(WizardStepType.UPLOAD), false, false);
          } else {
            this.wizardConf[this.getStepIndex(WizardStepType.PROGRESS_TRACK)].isHidden = false;
          }
        })
    );

    // capture "back" and "forward" events / sync with form data
    this.location.subscribe((state: PopStateEvent) => {
      const url = `${state.url}`;
      const ids = url.match(/\/dataset\/(\d+)/);

      if (!ids || ids.length === 0) {
        // clear the data, form data, pollers / set step to progress
        this.progressData = undefined;
        this.trackDatasetId = '';
        this.trackRecordId = '';
        this.buildForms();
        this.clearDataPollers();
        this.setStep(this.getStepIndex(WizardStepType.PROGRESS_TRACK), true, false);
      } else {
        this.trackDatasetId = ids[1];
        const regParamRecord = /\S+\?recordId=([^&]*)/;
        const regParamProblems = /[\?&]view=problems/;
        const matchParamRecord: RegExpMatchArray | null = url.match(regParamRecord);
        const matchParamProblems = !!url.match(regParamProblems);
        if (matchParamRecord) {
          this.trackRecordId = decodeURIComponent(matchParamRecord[1]);
          this.fillAndSubmitRecordForm(matchParamProblems);
        } else {
          this.fillAndSubmitProgressForm(matchParamProblems, false);
        }
      }
    });
  }

  /**
   * buildForms
   * builds the two forms
   **/
  buildForms(): void {
    this.formProgress = this.fb.group({
      datasetToTrack: ['', [Validators.required, this.validateDatasetId.bind(this)]]
    });

    this.formRecord = this.fb.group({
      recordToTrack: ['', [Validators.required, this.validateRecordId.bind(this)]]
    });

    this.wizardConf.forEach((step: WizardStep) => {
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
  validateDatasetId(control: FormControl): ValidationErrors | null {
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
      const matches = `${val}`.match(/[0-9]+/);
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
  validateRecordId(control: FormControl): ValidationErrors | null {
    const val = control.value;
    if (val) {
      if (!val.match(/^\S+$/)) {
        return { invalid: true };
      }
      const datasetIdCtrl = this.formProgress.get('datasetToTrack') as FormControl;
      if (!(datasetIdCtrl.value && datasetIdCtrl.valid)) {
        return { invalid: true };
      }
    }
    return null;
  }

  /**
   * getFormGroup
   * Returns the correct form for the given WizardStep
   *
   * @param { WizardStep } stepConf - the config to evaluate
   * @returns FormGroup
   **/
  getFormGroup(stepConf: WizardStep): FormGroup | undefined {
    if (stepConf.stepType === WizardStepType.PROGRESS_TRACK) {
      return this.formProgress;
    } else if (stepConf.stepType === WizardStepType.REPORT) {
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
   * @param { WizardStepType } stepType - the type
   * @returns nthe index
   **/
  getStepIndex(stepType: WizardStepType): number {
    return this.wizardConf.findIndex((step: WizardStep) => {
      return step.stepType === stepType;
    });
  }

  /**
   * getStepIsIndicator
   *
   * Template utility for setting 'indicator-orb' class on the step orbs
   * @param { number } stepIndex - the WizardStep index
   *
   * @returns boolean
   **/
  getStepIsIndicator(stepIndex: number): boolean {
    const step = this.wizardConf[stepIndex];
    if (step.stepType === WizardStepType.PROGRESS_TRACK) {
      return !!this.progressData;
    } else if (step.stepType === WizardStepType.REPORT) {
      return !!this.recordReport;
    } else if (step.stepType === WizardStepType.PROBLEMS_DATASET) {
      return !!this.problemPatternsDataset;
    } else if (step.stepType === WizardStepType.PROBLEMS_RECORD) {
      return !!this.problemPatternsRecord;
    }
    return this.uploadComponent && this.uploadComponent.form && this.uploadComponent.form.disabled;
  }

  /**
   * getIsRecordTrack
   * Returns true if the stepType of the WizardStep at the given index is REPORT
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsRecordTrack(stepIndex: number): boolean {
    return this.wizardConf[stepIndex].stepType === WizardStepType.REPORT;
  }

  /**
   * getIsProblem
   * Returns true if the stepType of the WizardStep at the given index is PROBLEMS_DATASET or PROBLEMS_RECORD
   *
   * @returns boolean
   **/
  getIsProblem(stepIndex: number): boolean {
    return [WizardStepType.PROBLEMS_DATASET, WizardStepType.PROBLEMS_RECORD].includes(
      this.wizardConf[stepIndex].stepType
    );
  }

  /**
   * getIsUpload
   * Returns true if the stepType of the WizardStep at the given conf index's stepType is UPLOAD
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsUpload(stepIndex: number): boolean {
    return this.wizardConf[stepIndex].stepType === WizardStepType.UPLOAD;
  }

  /**
   * setStep
   * Sets the currentStepIndex and isHidden values
   * Optionally resets the form
   * Optionally invokes this.updateLocation
   *
   * @param { number } stepIndex - the value to set
   * @param { boolean } reset - flag a reset
   * @param { boolean } updateLocation - flag a location update
   **/
  setStep(stepIndex: number, reset = false, updateLocation = true): void {
    if (reset) {
      const form = this.getFormGroup(this.wizardConf[stepIndex]);
      if (form && form.disabled) {
        form.enable();
        this.uploadComponent.rebuildForm();
      }
    }
    this.currentStepIndex = stepIndex;
    this.currentStepType = this.wizardConf[stepIndex].stepType;
    this.wizardConf[stepIndex].isHidden = false;

    if (this.currentStepType === WizardStepType.UPLOAD) {
      if (updateLocation) {
        this.updateLocation(false, false);
      }
    } else if (this.currentStepType === WizardStepType.PROGRESS_TRACK) {
      if (updateLocation) {
        this.updateLocation(true, false);
      }
    } else if (this.currentStepType === WizardStepType.REPORT) {
      if (updateLocation) {
        this.updateLocation(true, true, false);
      }
    } else if (this.currentStepType === WizardStepType.PROBLEMS_DATASET) {
      if (updateLocation) {
        this.updateLocation(true, false, true);
      }
    } else {
      if (updateLocation) {
        this.updateLocation(true, true, true);
      }
    }
  }

  /**
   * resetBusy
   * Resets the busy-tracking variables
   *
   **/
  resetBusy(): void {
    this.wizardConf.forEach((step: WizardStep) => {
      step.isBusy = false;
    });
    this.isPollingProgress = false;
    this.isPollingRecord = false;
  }

  /**
   * progressComplete
   * Template utility to determine if the progress is complete
   *
   **/
  progressComplete(): boolean {
    return !!this.progressData && this.progressData.status === DatasetStatus.COMPLETED;
  }

  /**
   * getConnectClasses
   *
   * @param { string } other - additional class to include with non-empty result
   **/
  getConnectClasses(other: string): ClassMap {
    if (!(this.formProgress.valid && this.formRecord.valid)) {
      return {};
    }
    const valDataset = this.formProgress.value.datasetToTrack;
    const valRecord = this.formRecord.value.recordToTrack;
    const match = valRecord.match(/\/(\d+)\/\S/);
    const connect = valDataset.length && valRecord.length && match;
    const res: ClassMap = {
      connect: !!connect,
      error: connect && match[1] !== valDataset
    };
    if (connect) {
      res[other] = true;
    }
    return res;
  }

  /**
   * submitDatasetProblemPatterns
   * Submits the trackDatasetId (problem patterns)
   **/
  submitDatasetProblemPatterns(): void {
    const confStep = this.wizardConf[this.getStepIndex(WizardStepType.PROBLEMS_DATASET)];
    confStep.isBusy = true;

    this.subs.push(
      this.sandbox.getProblemPatternsDataset(`${this.trackDatasetId}`).subscribe(
        (problemPatternsDataset: ProblemPatternsDataset) => {
          this.problemPatternsDataset = problemPatternsDataset;
          confStep.error = undefined;
          confStep.isBusy = false;
        },
        (err: HttpErrorResponse) => {
          this.problemPatternsDataset = undefined;
          confStep.error = err;
          this.resetBusy();
          return err;
        }
      )
    );
  }

  /**
   * submitDatasetProgress
   * Submits the trackDatasetId
   **/
  submitDatasetProgress(): void {
    const stepConf = this.wizardConf[this.getStepIndex(WizardStepType.PROGRESS_TRACK)];
    stepConf.isBusy = true;
    this.isPollingProgress = true;

    this.clearDataPollers();
    this.createNewDataPoller(
      apiSettings.interval,
      (): Observable<Dataset> => {
        return this.sandbox.requestProgress(`${this.trackDatasetId}`).pipe(
          // temporary removal of back-end info
          map((dataset: Dataset) => {
            const nullString =
              'A review URL will be generated when the dataset has finished processing';
            if (dataset['portal-publish'] === nullString) {
              console.log('delete portal publish copy');
              delete dataset['portal-publish'];
            }
            return dataset;
          })
        );
      },
      (progressInfo: Dataset) => {
        this.progressData = progressInfo;

        if (this.progressComplete()) {
          this.resetBusy();

          if (this.progressData['portal-publish']) {
            this.clearDataPollers();
          }
        }
        stepConf.error = undefined;
      },
      (err: HttpErrorResponse) => {
        this.progressData = undefined;
        stepConf.error = err;
        this.resetBusy();
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
      this.trackDatasetId = this.formProgress.value.datasetToTrack;

      if (action === ButtonAction.BTN_PROGRESS) {
        if (updateLocation) {
          this.setStep(this.getStepIndex(WizardStepType.PROGRESS_TRACK));
        }
        this.submitDatasetProgress();
      } else if (action === ButtonAction.BTN_PROBLEMS) {
        if (updateLocation) {
          this.setStep(this.getStepIndex(WizardStepType.PROBLEMS_DATASET));
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
    const stepConf = this.wizardConf[this.getStepIndex(WizardStepType.PROBLEMS_RECORD)];
    stepConf.isBusy = true;

    this.subs.push(
      this.sandbox
        .getProblemPatternsRecord(`${this.trackDatasetId}`, `${this.trackRecordId}`)
        .subscribe(
          (problemPatternsRecord: Array<ProblemPattern>) => {
            this.problemPatternsRecord = problemPatternsRecord;
            stepConf.error = undefined;
            stepConf.isBusy = false;
          },
          (err: HttpErrorResponse) => {
            this.problemPatternsRecord = undefined;
            stepConf.error = err;
            this.resetBusy();
            return err;
          }
        )
    );
  }

  /**
   * submitRecordReport
   * Submits the formRecord data
   **/
  submitRecordReport(): void {
    const stepConf = this.wizardConf[this.getStepIndex(WizardStepType.REPORT)];
    stepConf.isBusy = true;
    this.isPollingRecord = true;

    this.subs.push(
      this.sandbox.getRecordReport(`${this.trackDatasetId}`, `${this.trackRecordId}`).subscribe(
        (report: RecordReport) => {
          this.recordReport = report;
          this.resetBusy();
          stepConf.error = undefined;
        },
        (err: HttpErrorResponse): void => {
          this.recordReport = undefined;
          stepConf.error = err;
          this.resetBusy();
        }
      )
    );
  }

  /**
   * onSubmitRecord
   * Submits the formRecord data if valid, optionally calls updateLocation
   *
   * @param { ButtonAction } action - the desired action
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   **/
  onSubmitRecord(action: ButtonAction, updateLocation = false): void {
    const form = this.formRecord;

    if (form.valid) {
      this.trackRecordId = encodeURIComponent(this.formRecord.value.recordToTrack);
      this.trackDatasetId = this.formProgress.value.datasetToTrack;

      if (action === ButtonAction.BTN_RECORD) {
        this.submitRecordReport();
        if (updateLocation) {
          this.setStep(this.getStepIndex(WizardStepType.REPORT));
        }
      } else if (action === ButtonAction.BTN_PROBLEMS) {
        this.submitRecordProblemPatterns();
        if (updateLocation) {
          this.setStep(this.getStepIndex(WizardStepType.PROBLEMS_RECORD));
        }
      }
    }
  }

  /**
   * updateLocation
   * update page url (without invoking router)
   *
   * @param { true } progress - include the dataset id
   * @param { true } record - include the record id
   * @param { true } problems - include the record id
   * @returns boolean
   **/
  updateLocation(progress = true, record = true, problems = false): void {
    let newPath = '';
    if (progress && this.trackDatasetId) {
      newPath += `/dataset/${this.trackDatasetId}`;
      if (record && this.trackRecordId) {
        newPath += `?recordId=${this.trackRecordId}`;
        if (problems) {
          newPath += `&view=problems`;
        }
      } else if (problems) {
        newPath += `?view=problems`;
      }
    } else if (!progress && !record) {
      if (this.currentStepType === WizardStepType.UPLOAD) {
        newPath = '/new';
      }
    }

    // avoid pushing duplicate states to history
    if (this.location.path() !== newPath) {
      this.location.go(newPath);
    }
  }

  /**
   * setBusyUpload
   * sets the "busy" flag in WizardConf
   *
   * @param { boolean } isBusy - the value to set
   **/
  setBusyUpload(isBusy: boolean): void {
    this.wizardConf[this.getStepIndex(WizardStepType.UPLOAD)].isBusy = isBusy;
  }

  /**
   * dataUploaded
   * invoked when the upload form has been submitted
   *
   * @param { string } datasetId - the datset id
   **/
  dataUploaded(datasetId: string): void {
    this.resetBusy();
    this.trackDatasetId = datasetId;
    this.fillAndSubmitProgressForm(false);
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
    (this.formProgress.get('datasetToTrack') as FormControl).setValue(this.trackDatasetId);

    let step: WizardStepType;

    if (problems) {
      step = WizardStepType.PROBLEMS_DATASET;
    } else {
      step = WizardStepType.PROGRESS_TRACK;
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
  fillAndSubmitRecordForm(problems: boolean, updateLocation = true): void {
    (this.formProgress.get('datasetToTrack') as FormControl).setValue(this.trackDatasetId);
    (this.formRecord.get('recordToTrack') as FormControl).setValue(this.trackRecordId);

    let step: WizardStepType;

    if (problems) {
      step = WizardStepType.PROBLEMS_RECORD;
    } else {
      step = WizardStepType.REPORT;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);

    this.onSubmitRecord(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_RECORD,
      updateLocation
    );
  }

  /**
   * followProblemPatternLink
   * Handles click on (internal) link
   * @param { string } recordId - the record to open
   **/
  followProblemPatternLink(recordId: string): void {
    this.trackRecordId = recordId;
    this.fillAndSubmitRecordForm(false);
  }

}
