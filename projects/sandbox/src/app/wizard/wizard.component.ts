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

  error: HttpErrorResponse | undefined;
  formProgress: FormGroup;
  formRecord: FormGroup;
  isBusy = false;
  isBusyProgress = false;
  isBusyReport = false;
  isPollingProgress = false;
  isPollingRecord = false;
  EnumProtocolType = ProtocolType;
  EnumWizardStepType = WizardStepType;
  progressData?: Dataset;
  recordReport?: RecordReport;
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
      ]
    },
    {
      stepType: WizardStepType.PROGRESS_TRACK,
      fields: ['datasetToTrack']
    },
    {
      stepType: WizardStepType.PROBLEMS_DATASET,
      fields: []
    },
    {
      stepType: WizardStepType.REPORT,
      fields: ['recordToTrack']
    },
    {
      stepType: WizardStepType.PROBLEMS_RECORD,
      fields: []
    }
  ];
  hiddenOrbs = Array.from(Array(this.wizardConf.length).keys()).map(() => {
    return true;
  });

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
    const isProgressTrack = this.getIsProgressTrack(i);
    const isProblem = this.getIsProblem(i);
    const isRecordTrack = this.getIsRecordTrack(i);
    return {
      'progress-orb-container': isProgressTrack,
      'problem-orb-container': isProblem,
      'report-orb-container': isRecordTrack,
      hidden: this.hiddenOrbs[i]
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
    const isProgressTrack = this.getIsProgressTrack(i);
    const isRecordTrack = this.getIsRecordTrack(i);
    const isUpload = this.getIsUpload(i);

    const isLoading =
      (isProgressTrack && this.isBusyProgress) ||
      (isRecordTrack && this.isBusyReport) ||
      this.isBusy;

    const stepConf = this.wizardConf[i];

    return {
      'is-set': this.stepIsComplete(stepConf.stepType),
      'is-active': this.currentStepType === stepConf.stepType,
      'orb-square': this.getStepIsSubmittable(stepConf),
      'problem-orb': isProblemOrb,
      'progress-orb': isProgressTrack,
      'report-orb': isRecordTrack,
      'upload-orb': isUpload,
      'indicator-orb': this.getStepIsIndicator(i),
      'submitted-orb': this.getStepIsSubmitted(stepConf),
      spinner: isLoading,
      'indicate-complete':
        (!isRecordTrack && this.progressComplete()) || (isRecordTrack && !!this.recordReport),
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
            this.setStep(0, false, false);
          } else {
            this.hiddenOrbs[this.getStepIndex(WizardStepType.PROGRESS_TRACK)] = false;
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
    this.subs.push(
      this.formProgress.valueChanges.subscribe(() => {
        this.error = undefined;
        if (this.uploadComponent) {
          this.uploadComponent.error = undefined;
        }
      })
    );
    this.error = undefined;
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
    } else if (this.uploadComponent) {
      return this.uploadComponent.form;
    }
    return undefined;
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
   * getStepIsSubmittable
   *
   * @param { WizardStep } step - the WizardStep to evaluate
   * @returns boolean
   **/
  getStepIsSubmittable(step: WizardStep): boolean {
    const form = this.getFormGroup(step);
    if (form) {
      return form.valid;
    }
    return false;
  }

  /**
   * getStepIsSubmitted
   *
   * Template utility for setting 'submitted-orb' class on the step orbs
   * @param { number } stepIndex - the WizardStep index
   *
   * @returns boolean
   **/
  getStepIsSubmitted(step: WizardStep): boolean {
    if (step.stepType === WizardStepType.UPLOAD) {
      const uc = this.uploadComponent;
      if (uc && uc.form) {
        return uc.form.disabled;
      }
      return false;
    } else if (step.stepType === WizardStepType.REPORT) {
      return !!this.trackRecordId;
    }
    return !!this.trackDatasetId;
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
      return true;
    }
    if (step.stepType === WizardStepType.REPORT) {
      return !!this.trackRecordId;
    }
    return this.uploadComponent && this.uploadComponent.form && this.uploadComponent.form.disabled;
  }

  /**
   * getIsProgressTrack
   * Returns if the WizardStep at the given conf index's stepType is PROGRESS_TRACK
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsProgressTrack(stepIndex: number): boolean {
    return this.wizardConf[stepIndex].stepType === WizardStepType.PROGRESS_TRACK;
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
   * getIsProgressTrackOrReport
   * Returns true if the stepType of the WizardStep at currentStepIndex is PROGRESS_TRACK in REPORT
   *
   * @returns boolean
   **/
  getIsProgressTrackOrReport(): boolean {
    return [WizardStepType.PROGRESS_TRACK, WizardStepType.REPORT].includes(this.currentStepType);
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
   * Sets the currentStepIndex and hiddenOrbs
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

    if (this.currentStepType === WizardStepType.UPLOAD) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.UPLOAD)] = false;
      if (updateLocation) {
        this.updateLocation(false, false);
      }
    } else if (this.currentStepType === WizardStepType.PROGRESS_TRACK) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.PROGRESS_TRACK)] = false;
      if (updateLocation) {
        this.updateLocation(true, false);
      }
    } else if (this.currentStepType === WizardStepType.REPORT) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.REPORT)] = false;
      if (updateLocation) {
        this.updateLocation(true, true, false);
      }
    } else if (this.currentStepType === WizardStepType.PROBLEMS_DATASET) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.PROBLEMS_DATASET)] = false;
      if (updateLocation) {
        this.updateLocation(true, false, true);
      }
    } else if (this.currentStepType === WizardStepType.PROBLEMS_RECORD) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.PROBLEMS_RECORD)] = false;
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
    this.isBusy = false;
    this.isBusyProgress = false;
    this.isBusyReport = false;
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

  submitDatasetProblemPatterns(): void {
    console.log('submitDatasetProblemPatterns');
  }

  /**
   * submitDatasetProgress
   *
   **/
  submitDatasetProgress(): void {
    this.isBusyProgress = true;
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
        this.error = undefined;
      },
      (err: HttpErrorResponse) => {
        this.progressData = undefined;
        this.error = err;
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

  submitRecordProblemPatterns(): void {
    console.log('submitRecordProblemPatterns');
  }

  submitRecordReport(): void {
    this.isBusyReport = true;
    this.isPollingRecord = true;

    this.subs.push(
      this.sandbox.getRecordReport(`${this.trackDatasetId}`, `${this.trackRecordId}`).subscribe(
        (report: RecordReport) => {
          this.recordReport = report;
          this.resetBusy();
          this.error = undefined;
        },
        (err: HttpErrorResponse): void => {
          this.recordReport = undefined;
          this.error = err;
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
   * setBusy
   * sets the isBusy flag
   *
   * @param { boolean } isBusy - the value to set
   **/
  setBusy(isBusy: boolean): void {
    this.isBusy = isBusy;
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
    this.onSubmitProgress(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_PROGRESS,
      updateLocation
    );

    let step: WizardStepType;

    if (problems) {
      step = WizardStepType.PROBLEMS_DATASET;
    } else {
      step = WizardStepType.PROGRESS_TRACK;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);
  }

  /**
   * fillAndSubmitRecordForm
   * sets the recordToTrack value in the record form
   * submits the record form
   * sets currentStepIndex to the report
   * @param { boolean } problems - flag if loading report or problem-patterns
   * @param { true } updateLocation - flag onSubmitRecord to update url location
   **/
  fillAndSubmitRecordForm(problems: boolean, updateLocation = true): void {
    (this.formProgress.get('datasetToTrack') as FormControl).setValue(this.trackDatasetId);
    (this.formRecord.get('recordToTrack') as FormControl).setValue(this.trackRecordId);
    this.onSubmitRecord(
      problems ? ButtonAction.BTN_PROBLEMS : ButtonAction.BTN_RECORD,
      updateLocation
    );

    let step: WizardStepType;

    if (problems) {
      this.hiddenOrbs[this.getStepIndex(WizardStepType.PROBLEMS_RECORD)] = false;
      step = WizardStepType.PROBLEMS_RECORD;
    } else {
      step = WizardStepType.REPORT;
    }
    this.currentStepType = step;
    this.currentStepIndex = this.getStepIndex(step);
  }

  /**
   * stepIsComplete
   * Runs partial validation on this.formProgress and returns the validity
   *
   * @param { number } step - the index of the WizardStep to evaluate
   * @returns boolean
   **/
  stepIsComplete(stepType: WizardStepType): boolean {
    const wStep = this.wizardConf.find((step: WizardStep) => {
      return step.stepType === stepType;
    }) as WizardStep;
    const fields = wStep.fields;
    const form = this.getFormGroup(wStep);
    if (!form) {
      return false;
    }
    return !fields.find((f: string) => {
      const val = form.get(f) as FormControl;
      return !val.valid;
    });
  }
}
