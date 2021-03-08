import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { merge, Observable, timer } from 'rxjs';
import { DataPollingComponent } from '@shared';
import { apiSettings } from '../../environments/apisettings';
import {
  DatasetInfo,
  DatasetInfoStatus,
  SubmissionResponseData,
  WizardField,
  WizardStep,
  WizardStepType
} from '../_models';
import { SandboxService } from '../_services';
import { ProtocolType } from '@shared';

export interface ValidatorArrayHash {
  [key: string]: Array<Validators>;
}

@Component({
  selector: 'sb-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent extends DataPollingComponent {
  error: HttpErrorResponse | undefined;
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
  currentStepIndex: number;
  trackDatasetId: number;
  wizardConf: Array<WizardStep>;

  @Input() fileFormName: string;
  @Input() set _wizardConf(wizardConf: Array<WizardStep>) {
    this.wizardConf = wizardConf;
    this.currentStepIndex = this.getTrackProgressConfIndex();
    this.buildForms();
  }

  constructor(private readonly fb: FormBuilder, private readonly sandbox: SandboxService) {
    super();
  }

  /**
   * buildForms
   * builds the two forms
   **/
  buildForms(): void {
    this.formProgress = this.fb.group({
      idToTrack: ['', Validators.required]
    });
    this.formUpload = this.fb.group(
      this.wizardConf
        .filter((conf) => {
          return !!conf.fields;
        })
        .reduce((map: ValidatorArrayHash, conf: WizardStep) => {
          const test = (conf.fields ? conf.fields : [])
            .filter((map: WizardField) => !!map.name)
            .reduce((map: ValidatorArrayHash, wf: WizardField) => {
              const entry: Array<string | Validators[]> = [wf.defaultValue ? wf.defaultValue : ''];
              if (wf.validators) {
                entry.push(wf.validators);
              }
              map[wf.name] = entry;
              return map;
            }, {});
          return Object.assign(map, test);
        }, {})
    );

    this.subs.push(
      merge(this.formProgress.valueChanges, this.formUpload.valueChanges).subscribe(() => {
        this.error = undefined;
      })
    );
  }

  /**
   * getFormGroup
   * Template utility: returns the correct form for the given WizardStep
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
   * @param { number } step - the index of the WizardStep to evaluate
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
   * getTrackProgressConfIndex
   * Returns the index of the PROGRESS_TRACK step within this.wizardConf or -1
   *
   * @return number
   **/
  getTrackProgressConfIndex(): number {
    const result = this.wizardConf.reduce(
      (arr: Array<number>, step: { stepType: WizardStepType }, index: number) => {
        if (step.stepType === WizardStepType.PROGRESS_TRACK) {
          arr.push(index);
        }
        return arr;
      },
      []
    );
    if (result.length === 1) {
      return result[0];
    }
    return -1;
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
    return this.progressData && this.progressData.status === DatasetInfoStatus.COMPLETED
      ? true
      : false;
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
      ctrl.setValue('');

      this.isBusyProgress = true;
      this.clearDataPollers();

      this.createNewDataPoller(
        apiSettings.interval,
        (): Observable<DatasetInfo> => {
          this.isPolling = true;
          return this.sandbox.requestProgress(idToTrack);
        },
        (progressInfo: DatasetInfo) => {
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
            this.formUpload.value.name,
            this.formUpload.value.country,
            this.formUpload.value.language,
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
                this.currentStepIndex = this.getTrackProgressConfIndex();
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
    if (this.wizardConf[step].stepType === WizardStepType.PROGRESS_TRACK) {
      const val = this.formProgress.get('idToTrack');
      return val ? val.valid : !!this.trackDatasetId;
    }
    const fields = this.wizardConf[step].fields;
    return fields
      ? !fields
          .filter((f: { name: string }) => !!f.name)
          .find((f: { name: string }) => {
            const val = this.formUpload.get(f.name);
            return val ? !val.valid : false;
          })
      : false;
  }
}
