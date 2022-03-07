import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, PopStateEvent } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { combineLatest, Observable, timer } from 'rxjs';
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

@Component({
  selector: 'sb-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent extends DataPollingComponent implements OnInit {
  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;
  @ViewChild(UploadComponent, { static: false }) uploadComponent: UploadComponent;

  error: HttpErrorResponse | undefined;
  formProgress: FormGroup;
  formRecord: FormGroup;
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
  wizardConf: FixedLengthArray<WizardStep, 3> = [
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
    const isUpload = this.getIsUpload(i);
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
            this.progressOrbHidden = true;
            this.fillAndSubmitRecordForm();
          } else if (preloadDatasetId) {
            this.trackDatasetId = preloadDatasetId;
            this.fillAndSubmitProgressForm();
          } else if (window.location.toString().match(/\/new$/)) {
            this.setStep(0, false, false);
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
        this.setStep(this.stepIndexProgress, true, false);
      } else {
        this.trackDatasetId = ids[1];

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
    if (this.getIsProgressTrack(stepIndex)) {
      return true;
    }
    if (this.wizardConf[stepIndex].stepType === WizardStepType.REPORT) {
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
   * Returns true if the WizardStep at the given conf index's stepType is REPORT
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
   * getIsUpload
   * Returns true if the WizardStep at the given conf index's stepType is UPLOAD
   *
   * @param { number } stepIndex - the config index to evaluate
   * @returns boolean
   **/
  getIsUpload(stepIndex: number): boolean {
    return this.wizardConf[stepIndex].stepType === WizardStepType.UPLOAD;
  }

  /**
   * setStep
   * Sets the currentStepIndex and sets datasetOrbsHidden to false.
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
    if (stepIndex < this.stepIndexProgress) {
      this.datasetOrbsHidden = false;
      if (updateLocation) {
        this.updateLocation(false, false);
      }
    } else if (stepIndex + 1 < this.wizardConf.length) {
      // initial enabling of progress tracker
      this.progressOrbHidden = false;
      if (updateLocation) {
        this.updateLocation(true, false);
      }
    } else if (updateLocation) {
      this.updateLocation(true, true);
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
        const pathBase = 'dataset';
        const newPath = `${pathBase}/${datasetToTrack}`;
        const splitPath = this.location.path().split('?');
        if (splitPath.length > pathBase.length + 1 || splitPath[0] !== newPath) {
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
    if (progress && this.trackDatasetId) {
      newPath += `/dataset/${this.trackDatasetId}`;
      if (record && this.trackRecordId) {
        newPath += `?recordId=${this.trackRecordId}`;
      }
    } else if (!progress && !record) {
      if (this.currentStepIndex === 0) {
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
    this.fillAndSubmitProgressForm();
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
    if (!form) {
      return false;
    }
    return !fields.find((f: string) => {
      const val = form.get(f) as FormControl;
      return !val.valid;
    });
  }
}
