import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import {
  DataPollingComponent,
  FileUploadComponent,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';

import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';

import { SandboxService } from '../_services';

@Component({
  selector: 'sb-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent extends DataPollingComponent {
  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;
  @Output() notifyBusy: EventEmitter<boolean> = new EventEmitter();
  @Output() notifySubmitted: EventEmitter<string> = new EventEmitter();
  @Input() showing = false;

  form: FormGroup;
  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';

  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  public EnumProtocolType = ProtocolType;

  error: HttpErrorResponse | undefined;

  constructor(private readonly sandbox: SandboxService) {
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
    this.buildForm();
  }

  rebuildForm(): void {
    // TODO: ViewChild needed for each of these
    /*
    this.protocolFields.clearFileValue();
    this.xslFileField.clearFileValue();
    */
    this.buildForm();
  }

  buildForm(): void {
    this.form = new FormBuilder().group({
      name: ['', [Validators.required, this.validateDatasetName]],
      country: ['', [Validators.required]],
      language: ['', [Validators.required]],
      uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
      url: ['', [Validators.required]],
      dataset: ['', [Validators.required]],
      harvestUrl: ['', [Validators.required]],
      setSpec: [''],
      metadataFormat: [''],
      sendXSLT: [''],
      xsltFile: ['']
    });
  }

  /**
   * protocolIsValid
   *
   * partial form validation
   *
   * @returns boolean
   **/
  protocolIsValid(): boolean {
    if (this.form) {
      const protocolFieldNames = [
        'uploadProtocol',
        'url',
        'dataset',
        'harvestUrl',
        'setSpec',
        'metadataFormat',
        'xsltFile'
      ];
      return !protocolFieldNames.find((f: string) => {
        const val = this.form.get(f) as FormControl;
        return !val.valid;
      });
    }
    return false;
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
   * onSubmitDataset
   * Submits the form data if valid
   **/
  onSubmitDataset(): void {
    const form = this.form;

    if (form.valid) {
      form.disable();
      this.notifyBusy.emit(true);
      this.subs.push(
        this.sandbox.submitDataset(form, [this.zipFileFormName, this.xsltFileFormName]).subscribe(
          (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
            // treat as SubmissionResponseDataWrapped
            res = (res as unknown) as SubmissionResponseDataWrapped;
            if (res.body) {
              this.notifySubmitted.emit(res.body['dataset-id']);
            } else if (form.value.url || form.value.harvestUrl) {
              this.notifySubmitted.emit(((res as unknown) as SubmissionResponseData)['dataset-id']);
            }
          },
          (err: HttpErrorResponse): void => {
            this.error = err;
            this.notifyBusy.emit(false);
          }
        )
      );
    }
  }

  /**
   * updateConditionalXSLValidator
   * Removes or adds the required validator in the form for the 'xsltFile' depending on the value of 'sendXSLT'
   **/
  updateConditionalXSLValidator(): void {
    const fn = (): void => {
      const ctrlFile = this.form.get(this.xsltFileFormName);
      const ctrl = this.form.get('sendXSLT');

      if (ctrl && ctrlFile) {
        if (ctrl.value) {
          ctrlFile.setValidators([Validators.required]);
        } else {
          ctrlFile.setValidators(null);
        }
        ctrlFile.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    };
    this.subs.push(this.form.valueChanges.subscribe(fn));
    fn();
  }
}
