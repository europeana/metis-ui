import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { merge } from 'rxjs';
import { DataPollingComponent } from '@shared';
import { DatasetInfo, SubmissionResponseData, WizardField, WizardStep } from '../_models';
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
  isBusy = false;
  orbsHidden = true;
  protocolType = ProtocolType;
  progressData: DatasetInfo;
  step: number;
  trackId: number;
  wizardConf: Array<WizardStep>;

  @Input() fileFormName: string;
  @Input() set _wizardConf(wizardConf: Array<WizardStep>) {
    this.wizardConf = wizardConf;
    this.step = this.wizardConf.length - 1;
    this.buildForms();
  }

  constructor(private readonly fb: FormBuilder, private readonly sandbox: SandboxService) {
    super();
  }

  getFormGroup(conf: WizardStep): FormGroup {
    return conf.title === 'progress' ? this.formProgress : this.formUpload;
  }

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

  getOrbsAreSquare(): boolean {
    return this.step === 3 && !!this.formProgress.value.idToTrack;
  }

  setStep(step: number): void {
    this.orbsHidden = false;
    this.step = step;
  }

  resetBusy(): void {
    const fn = (): void => {
      this.isBusy = false;
    };
    setTimeout(fn, 500);
  }

  onSubmitProgress(): void {
    const form = this.formProgress;
    const idToTrack = this.formProgress.value.idToTrack;

    if (form.valid) {
      this.isBusy = true;
      this.subs.push(
        this.sandbox.requestProgress(idToTrack).subscribe(
          (progressInfo: DatasetInfo) => {
            this.progressData = progressInfo;
            this.trackId = idToTrack;
            this.resetBusy();
          },
          (err: HttpErrorResponse): void => {
            this.error = err;
            this.resetBusy();
          }
        )
      );
    }
  }

  /** onSubmitDataset
  /* - submit the form data if valid
  */
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
                const trackId = res.body['dataset-id'];
                this.trackId = trackId;
                this.step = this.wizardConf.length - 1;
              }
            },
            (err: HttpErrorResponse): void => {
              this.error = err;
            }
          )
      );
    }
  }

  stepIsComplete(step: number): boolean {
    if (this.wizardConf[step].title === 'progress') {
      const val = this.formProgress.get('idToTrack');
      return val ? val.valid : !!this.trackId;
    }
    const fields = this.wizardConf[step].fields;
    if (fields) {
      return !fields
        .filter((f: { name: string }) => !!f.name)
        .find((f: { name: string }) => {
          const val = this.formUpload.get(f.name);
          return val ? !val.valid : false;
        });
    } else {
      return false;
    }
  }
}
