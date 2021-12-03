import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { merge, Observable, timer } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
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
export class WizardComponent extends DataPollingComponent {
  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;

  error: HttpErrorResponse | undefined;
  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';
  formProgress: FormGroup;
  formUpload: FormGroup;
  resetBusyDelay = 1000;
  isBusy = false;
  isBusyProgress = false;
  isPolling = false;
  orbsHidden = true;
  EnumProtocolType = ProtocolType;
  EnumWizardStepType = WizardStepType;
  progressData: Dataset;
  trackDatasetId: string;
  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  wizardConf: FixedLengthArray<WizardStep, 4> = [
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
      fields: ['uploadProtocol', 'dataset', 'url', 'sendXSLT', this.xsltFileFormName]
    },
    {
      stepType: WizardStepType.PROGRESS_TRACK,
      fields: ['idToTrack']
    }
  ];
  currentStepIndex = this.wizardConf.length - 1;

  constructor(private readonly fb: FormBuilder, private readonly sandbox: SandboxService) {
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
   * buildForms
   * builds the two forms
   **/
  buildForms(): void {
    this.formProgress = this.fb.group({
      idToTrack: ['', [Validators.required, this.validateDatasetId]]
    });

    this.formUpload = this.fb.group({
      name: ['', [Validators.required, this.validateDatasetName]],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
      url: ['', [Validators.required]],
      dataset: ['', [Validators.required]],
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
   * form validator implementation for dataset id field
   *
   * @param { FormControl } control - the control to validate
   * @returns null or a code-keyed boolean
   **/
  validateDatasetId(control: FormControl): { [key: string]: boolean } | null {
    const val = control.value;
    if (val) {
      const matches = `${val}`.match(/[0-9]+/);
      if (!matches || matches[0] !== val) {
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
  validateDatasetName(control: FormControl): { [key: string]: boolean } | null {
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
    return stepConf.stepType === WizardStepType.PROGRESS_TRACK
      ? this.formProgress
      : this.formUpload;
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
   * setStep
   * Sets the currentStepIndex and sets orbsHidden to false.
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
        if (this.protocolFields) {
          this.protocolFields.clearFileValue();
        }
        if (this.xslFileField) {
          this.xslFileField.clearFileValue();
        }
        this.buildForms();
      }
    }
    this.orbsHidden = false;
    this.currentStepIndex = stepIndex;
  }

  /**
   * canGoToPrevious
   * Template utility: returns navigation to previous step is possible
   *
   * @returns boolean
   **/
  canGoToPrevious(): boolean {
    if ([1, 2].includes(this.currentStepIndex)) {
      return true;
    }
    return this.currentStepIndex === 3 && this.formUpload.disabled;
  }

  /**
   * canGoToNext
   * Template utility: returns navigation to next step is possible
   *
   * @returns boolean
   **/
  canGoToNext(): boolean {
    if (this.currentStepIndex === 2) {
      return this.formUpload.disabled;
    } else {
      return this.currentStepIndex < this.wizardConf.length - 1;
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
      this.isPolling = false;
      sub.unsubscribe();
    });
  }

  /**
   * progressComplete
   * Template utility to determine if the progress is complete
   *
   **/
  progressComplete(): boolean {
    return this.progressData && this.progressData.status === DatasetStatus.COMPLETED;
  }

  /**
   * onSubmitProgress
   * Submits the formProgress data if valid
   *
   **/
  onSubmitProgress(): void {
    const form = this.formProgress;

    if (form.valid) {
      const ctrl = this.formProgress.get('idToTrack') as FormControl;
      const idToTrack = ctrl.value;

      this.isBusyProgress = true;
      this.clearDataPollers();

      this.createNewDataPoller(
        apiSettings.interval,
        (): Observable<Dataset> => {
          this.isPolling = true;
          return this.sandbox.requestProgress(idToTrack);
        },
        (progressInfo: Dataset) => {
          this.progressData = progressInfo;
          this.trackDatasetId = idToTrack;
          if (this.progressComplete()) {
            this.clearDataPollers();
          }
          this.resetBusy();
          this.error = undefined;
        },
        (err: HttpErrorResponse) => {
          this.error = err;
          this.resetBusy();
          return err;
        }
      );
    }
  }

  /**
   * onDataSubmissionComplete
   * sets the idToTrack value in the progress form
   * submits the progress form
   * sets currentStepIndex to its max value
   **/
  onDataSubmissionComplete(): void {
    (this.formProgress.get('idToTrack') as FormControl).setValue(this.trackDatasetId);
    this.onSubmitProgress();
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
              this.onDataSubmissionComplete();
              console.log('response has body >>> ' + this.trackDatasetId);
            } else if (form.value.url) {
              this.trackDatasetId = ((res as unknown) as SubmissionResponseData)['dataset-id'];
              this.onDataSubmissionComplete();
              console.log('response has NO body >>> ' + this.trackDatasetId);
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
