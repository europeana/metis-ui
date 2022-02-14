import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, merge, Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  DataPollingComponent,
  FileUploadComponent,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';

import { apiSettings } from '../../environments/apisettings';
import {
  ClassMap,
  Dataset,
  DatasetStatus,
  FieldOption,
  FixedLengthArray,
  RecordReport,
  SubmissionResponseData,
  SubmissionResponseDataWrapped,
  WizardStep,
  WizardStepType
} from '../_models';
import { SandboxService } from '../_services';

@Component({
  selector: 'sb-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent extends DataPollingComponent implements OnInit {
  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;

  error: HttpErrorResponse | undefined;
  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';
  formProgress: FormGroup;
  formRecord: FormGroup;
  formUpload: FormGroup;
  resetBusyDelay = 1000;
  isBusy = false;
  isBusyProgress = false;
  isBusyProgressLinks = false;
  isBusyReport = false;
  isPollingProgress = false;
  isPollingRecord = false;
  datasetOrbsHidden = true;
  progressOrbHidden = false;
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
      stepType: WizardStepType.SET_NAME,
      fields: ['name']
    },
    {
      stepType: WizardStepType.SET_LANG_LOCATION,
      fields: ['country', 'language']
    },
    {
      stepType: WizardStepType.PROTOCOL_SELECT,
      fields: [
        'uploadProtocol',
        'dataset',
        'url',
        'sendXSLT',
        this.xsltFileFormName,
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
      stepType: WizardStepType.REPORT,
      fields: ['recordToTrack']
    }
  ];

  stepIndexProgress = this.wizardConf.findIndex((step) => {
    return step.stepType === WizardStepType.PROGRESS_TRACK;
  });

  currentStepIndex = this.stepIndexProgress;

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
    return {
      'progress-orb-container': this.getIsProgressTrack(i),
      'report-orb-container': this.getIsRecordTrack(i),
      hidden:
        (this.getIsRecordTrack(i) && !this.trackRecordId) ||
        (this.getIsProgressTrack(i) && this.progressOrbHidden)
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
    const stepConf = this.wizardConf[i];
    const isProgressTrack = this.getIsProgressTrack(i);
    const isRecordTrack = this.getIsRecordTrack(i);
    const isLoading =
      (isProgressTrack && this.isBusyProgress) ||
      (isRecordTrack && this.isBusyReport) ||
      this.isBusy;
    return {
      'is-set': this.stepIsComplete(i),
      'is-active': this.currentStepIndex === i,
      'orb-square': this.getStepIsSubmittable(stepConf),
      'progress-orb': isProgressTrack,
      'report-orb': isRecordTrack,
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
            this.progressOrbHidden = true;
            this.fillAndSubmitRecordForm();
          } else if (preloadDatasetId) {
            this.trackDatasetId = preloadDatasetId;
            this.fillAndSubmitProgressForm();
          }
        })
    );

    // capture "back" and "forward" events / sync with form data
    this.location.subscribe((state: PopStateEvent) => {
      const url = `${state.url}`;
      const ids = url.split('/').filter((s: string) => {
        return s.length > 0;
      });

      if (ids.length === 0) {
        // clear the data, form data, pollers / set step to progress
        this.progressData = undefined;
        this.trackDatasetId = '';
        this.trackRecordId = '';
        this.buildForms();
        this.clearDataPollers();
        this.setStep(this.stepIndexProgress, true);
      } else {
        this.trackDatasetId = ids[0];

        const queryParamRegex = /\S+\?recordId=(\S+)/;
        const queryParamMatch: RegExpMatchArray | null = url.match(queryParamRegex);

        if (queryParamMatch) {
          this.trackRecordId = decodeURIComponent(queryParamMatch[1]);
          this.fillAndSubmitRecordForm(false);
        } else {
          this.fillAndSubmitProgressForm(false);
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

    this.formUpload = this.fb.group({
      name: ['', [Validators.required, this.validateDatasetName]],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
      url: ['', [Validators.required]],
      dataset: ['', [Validators.required]],
      harvestUrl: ['', [Validators.required]],
      setSpec: [''],
      metadataFormat: [''],
      sendXSLT: ['']
    });
    this.formUpload.addControl(this.xsltFileFormName, new FormControl(''));

    this.subs.push(
      merge(this.formProgress.valueChanges, this.formUpload.valueChanges).subscribe(() => {
        this.error = undefined;
      })
    );
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
   * validateDatasetName
   *
   * form validator implementation for dataset name field
   *
   * @param { FormControl } control - the control to validate
   * @returns null or a code-keyed boolean
   **/
  validateDatasetName(control: FormControl): ValidationErrors | null {
    const val = control.value;
    if (val) {
      const matches = `${val}`.match(/[a-zA-Z0-9_]+/);
      if (!matches || matches[0] !== val) {
        return { invalid: true };
      }
    }
    return null;
  }

  /**
   * updateConditionalXSLValidator
   * Removes or adds the required validator in formUpload for the 'xsltFile' depending on the value of 'sendXSLT'
   **/
  updateConditionalXSLValidator(): void {
    const fn = (): void => {
      const ctrlFile = this.formUpload.get(this.xsltFileFormName);
      const ctrl = this.formUpload.get('sendXSLT');

      if (ctrl && ctrlFile) {
        if (ctrl.value) {
          ctrlFile.setValidators([Validators.required]);
        } else {
          ctrlFile.setValidators(null);
        }
        ctrlFile.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    };
    this.subs.push(this.formUpload.valueChanges.subscribe(fn));
    fn();
  }

  /**
   * getFormGroup
   * Returns the correct form for the given WizardStep
   *
   * @param { WizardStep } stepConf - the config to evaluate
   * @returns FormGroup
   **/
  getFormGroup(stepConf: WizardStep): FormGroup {
    if (stepConf.stepType === WizardStepType.PROGRESS_TRACK) {
      return this.formProgress;
    } else if (stepConf.stepType === WizardStepType.REPORT) {
      return this.formRecord;
    } else {
      return this.formUpload;
    }
  }

  /**
   * getStepIsSubmittable
   *
   * @param { WizardStep } step - the WizardStep to evaluate
   * @returns boolean
   **/
  getStepIsSubmittable(step: WizardStep): boolean {
    return this.getFormGroup(step).valid;
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
    if (
      [
        WizardStepType.SET_NAME,
        WizardStepType.SET_LANG_LOCATION,
        WizardStepType.PROTOCOL_SELECT
      ].includes(step.stepType) &&
      this.formUpload.disabled
    ) {
      return true;
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
    if (this.getIsProgressTrack(stepIndex)) {
      return true;
    }
    if (this.wizardConf[stepIndex].stepType === WizardStepType.REPORT) {
      return !!this.trackRecordId;
    }
    return this.formUpload.disabled;
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
   * Returns if the WizardStep at the given conf index's stepType is REPORT
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsRecordTrack(stepIndex: number): boolean {
    return this.wizardConf[stepIndex].stepType === WizardStepType.REPORT;
  }

  /**
   * getIsProgressTrackOrReport
   * Returns true if the WizardStep at currentStepIndex is PROGRESS_TRACK in REPORT
   *
   * @returns boolean
   **/
  getIsProgressTrackOrReport(stepIndex?: number): boolean {
    const index = stepIndex ? stepIndex : this.currentStepIndex;
    return this.getIsRecordTrack(index) || this.getIsProgressTrack(index);
  }

  /**
   * setStep
   * Sets the currentStepIndex and sets datasetOrbsHidden to false.
   * Optionally resets the form
   *
   * @param { number } stepIndex - the value to set
   * @param { boolean } reset - flag a reset
   **/
  setStep(stepIndex: number, reset = false): void {
    if (reset) {
      const form = this.getFormGroup(this.wizardConf[stepIndex]);
      if (form.disabled) {
        form.enable();
        this.protocolFields.clearFileValue();
        this.xslFileField.clearFileValue();
        this.buildForms();
      }
    }

    if (stepIndex < this.stepIndexProgress) {
      this.datasetOrbsHidden = false;
      this.updateLocation(false, false);
    } else if (stepIndex + 1 < this.wizardConf.length) {
      // initial enabling of progress tracker
      this.progressOrbHidden = false;
      this.updateLocation(true, false);
    } else {
      // record report
      this.updateLocation(true, true);
    }
    this.currentStepIndex = stepIndex;
  }

  /**
   * canGoToPrevious
   * Template utility: returns navigation to previous step is possible
   *
   * @returns boolean
   **/
  canGoToPrevious(): boolean {
    if (this.currentStepIndex > 0 && this.currentStepIndex < this.stepIndexProgress) {
      return true;
    }
    return this.currentStepIndex === this.stepIndexProgress && this.formUpload.disabled;
  }

  /**
   * canGoToNext
   * Template utility: returns navigation to next step is possible
   *
   * @returns boolean
   **/
  canGoToNext(): boolean {
    if (this.currentStepIndex === this.stepIndexProgress - 1) {
      return this.formUpload.disabled;
    } else {
      return this.currentStepIndex < this.stepIndexProgress;
    }
  }

  /**
   * resetBusy
   * Resets the busy-tracking variables
   *
   **/
  resetBusy(): void {
    const sub = timer(this.resetBusyDelay).subscribe(() => {
      this.isBusy = false;
      this.isBusyProgress = false;
      this.isBusyReport = false;
      this.isPollingProgress = false;
      this.isPollingRecord = false;
      sub.unsubscribe();
    });
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
    const valD = this.formProgress.value.datasetToTrack;
    const valR = this.formRecord.value.recordToTrack;
    const match = valR.match(/\/(\d+)\/\S/);
    const connect = valD.length && valR.length && match;
    const res: ClassMap = {
      connect: connect,
      error: connect && match[1] !== valD
    };
    if (connect) {
      res[other] = true;
    }
    return res;
  }

  /**
   * onSubmitProgress
   * Submits the formProgress data if valid
   *
   **/
  onSubmitProgress(updateLocation = false): void {
    const form = this.formProgress;

    if (form.valid) {
      const ctrl = this.formProgress.get('datasetToTrack') as FormControl;
      const datasetToTrack = ctrl.value;

      this.trackDatasetId = datasetToTrack;

      if (updateLocation) {
        const newPath = `/${datasetToTrack}`;
        const splitPath = this.location.path().split('?');
        if (splitPath.length > 1 || splitPath[0] !== newPath) {
          this.setStep(this.stepIndexProgress);
        }
      }

      this.isBusyProgress = true;
      this.isBusyProgressLinks = true;
      this.isPollingProgress = true;

      this.clearDataPollers();

      this.createNewDataPoller(
        apiSettings.interval,
        (): Observable<Dataset> => {
          return this.sandbox.requestProgress(datasetToTrack).pipe(
            // temporary removal of back-end info
            map((dataset: Dataset) => {
              const nullString =
                'A review URL will be generated when the dataset has finished processing';
              if (dataset['portal-preview'] === nullString) {
                delete dataset['portal-preview'];
              }
              if (dataset['portal-publish'] === nullString) {
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

            if (this.progressData['portal-preview'] && this.progressData['portal-publish']) {
              this.isBusyProgressLinks = false;
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
  }

  /**
   * onSubmitRecord
   * Submits the formRecord data if valid, optionally calls updateLocation
   *
   * @param { boolean } updateLocation - flag if updateLocation function should be called
   **/
  onSubmitRecord(updateLocation = false): void {
    const form = this.formRecord;

    if (form.valid) {
      this.trackRecordId = encodeURIComponent(this.formRecord.value.recordToTrack);
      this.trackDatasetId = this.formProgress.value.datasetToTrack;
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
      if (updateLocation) {
        this.setStep(this.wizardConf.length - 1);
      }
    }
  }

  /**
   * updateLocation
   * update page url (without invoking router)
   *
   * @param { true } progress - include the dataset id
   * @param { true } record - include the record id
   * @returns boolean
   **/
  updateLocation(progress = true, record = true): void {
    let newPath = '';
    if (progress) {
      newPath += `/${this.trackDatasetId}`;
      if (record) {
        newPath += `?recordId=${this.trackRecordId}`;
      }
    }

    // avoid pushing duplicate states to history
    if (this.location.path() !== newPath) {
      this.location.go(newPath);
    }
  }

  /**
   * fillAndSubmitProgressForm
   * sets the datasetToTrack value in the progress form
   * submits the progress form (flags to update window location)
   * sets currentStepIndex to track the progress
   *
   * @param { true } updateLocation - flag onSubmitProgress to update url location
   **/
  fillAndSubmitProgressForm(updateLocation = true): void {
    (this.formProgress.get('datasetToTrack') as FormControl).setValue(this.trackDatasetId);
    this.onSubmitProgress(updateLocation);
    this.currentStepIndex = this.stepIndexProgress;
    this.progressOrbHidden = false;
  }

  /**
   * fillAndSubmitRecordForm
   * sets the recordToTrack value in the record form
   * submits the record form
   * sets currentStepIndex to the report
   * @param { true } updateLocation - flag onSubmitRecord to update url location
   **/
  fillAndSubmitRecordForm(updateLocation = true): void {
    (this.formProgress.get('datasetToTrack') as FormControl).setValue(this.trackDatasetId);
    (this.formRecord.get('recordToTrack') as FormControl).setValue(this.trackRecordId);
    this.onSubmitRecord(updateLocation);
    this.currentStepIndex = this.wizardConf.length - 1;
  }

  /**
   * onSubmitDataset
   * Submits the formUpload data if valid
   **/
  onSubmitDataset(): void {
    const form = this.formUpload;

    if (form.valid) {
      form.disable();
      this.isBusy = true;
      this.subs.push(
        this.sandbox.submitDataset(form, [this.zipFileFormName, this.xsltFileFormName]).subscribe(
          (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
            this.resetBusy();

            // treat as SubmissionResponseDataWrapped
            res = (res as unknown) as SubmissionResponseDataWrapped;

            if (res.body) {
              this.trackDatasetId = res.body['dataset-id'];
              this.fillAndSubmitProgressForm();
            } else if (form.value.url || form.value.harvestUrl) {
              this.trackDatasetId = ((res as unknown) as SubmissionResponseData)['dataset-id'];
              this.fillAndSubmitProgressForm();
            }
          },
          (err: HttpErrorResponse): void => {
            this.error = err;
            this.resetBusy();
          }
        )
      );
    }
  }

  /**
   * stepIsComplete
   * Runs partial validation on this.formProgress and returns the validity
   *
   * @param { number } step - the index of the WizardStep to evaluate
   * @returns boolean
   **/
  stepIsComplete(step: number): boolean {
    const wStep = this.wizardConf[step];
    const fields = wStep.fields;
    const form = this.getFormGroup(wStep);
    return !fields.find((f: string) => {
      const val = form.get(f) as FormControl;
      return !val.valid;
    });
  }
}
