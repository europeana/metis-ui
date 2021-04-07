import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { merge, Observable, timer } from 'rxjs';
import { DataPollingComponent, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetInfo,
  DatasetInfoStatus,
  FieldOption,
  FixedLengthArray,
  SubmissionResponseData,
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
  error: HttpErrorResponse | undefined;
  fileFormName = 'dataset';
  formProgress: FormGroup;
  formUpload: FormGroup;
  resetBusyDelay = 1000;
  isBusy = false;
  isBusyProgress = false;
  isPolling = false;
  orbsHidden = true;
  EnumProtocolType = ProtocolType;
  EnumWizardStepType = WizardStepType;
  progressData: DatasetInfo;
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
      fields: ['uploadProtocol', 'dataset']
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
      dataset: ['', [Validators.required]]
    });

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
    return this.progressData && this.progressData.status === DatasetInfoStatus.COMPLETED;
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
        (): Observable<DatasetInfo> => {
          this.isPolling = true;
          return this.sandbox.requestProgress(idToTrack);
        },
        (progressInfo: DatasetInfo) => {
          ctrl.setValue('');
          this.progressData = progressInfo;
          this.trackDatasetId = idToTrack;
          if (this.progressComplete()) {
            this.clearDataPollers();
          }
          this.resetBusy();
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
   * onSubmitDataset
   * Submits the formUpload data if valid
   **/
  onSubmitDataset(): void {
    const form = this.formUpload;

    if (form.valid) {
      form.disable();
      this.isBusy = true;
      this.subs.push(
        this.sandbox
          .submitDataset(
            form.value.name,
            form.value.country,
            form.value.language,
            this.fileFormName,
            form.get(this.fileFormName)!.value
          )
          .subscribe(
            (res: SubmissionResponseData) => {
              this.resetBusy();
              if (res.body) {
                this.trackDatasetId = res.body['dataset-id'];
                (this.formProgress.get('idToTrack') as FormControl).setValue(this.trackDatasetId);
                this.onSubmitProgress();
                this.currentStepIndex = this.wizardConf.length - 1;
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
