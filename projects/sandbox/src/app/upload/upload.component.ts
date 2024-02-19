import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  DataPollingComponent,
  FileUploadComponent,
  ModalConfirmService,
  ProtocolFieldSetComponent,
  ProtocolType,
  SharedModule
} from 'shared';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';
import { SandboxService } from '../_services';
import { HttpErrorsComponent } from '../http-errors/errors.component';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sb-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgFor,
    NgIf,
    SharedModule,
    NgTemplateOutlet,
    HttpErrorsComponent
  ]
})
export class UploadComponent extends DataPollingComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly sandbox = inject(SandboxService);
  private readonly modalConfirms = inject(ModalConfirmService);

  public EnumProtocolType = ProtocolType;

  @ViewChild(ProtocolFieldSetComponent, { static: true })
  protocolFields: ProtocolFieldSetComponent;
  @ViewChild(FileUploadComponent, { static: true }) xslFileField: FileUploadComponent;
  @Output() notifyBusy: EventEmitter<boolean> = new EventEmitter();
  @Output() notifySubmitted: EventEmitter<string> = new EventEmitter();
  @Input() showing = false;

  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';

  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  modalIdStepSizeInfo = 'id-modal-step-size-info';

  error: HttpErrorResponse | undefined;

  constructor() {
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
    this.subs.push(
      this.form.valueChanges.subscribe(() => {
        this.error = undefined;
      })
    );
    this.error = undefined;
  }

  /**
   * rebuildForm
   *
   * invokes form reset after clearing file inputs from previous submission
   **/
  rebuildForm(): void {
    this.protocolFields.clearFileValue();
    this.xslFileField.clearFileValue();
    this.form.reset();
    this.form.controls.stepSize.setValue('1');
    this.error = undefined;
  }

  form = this.formBuilder.group({
    name: ['', [Validators.required, this.validateDatasetName]],
    country: ['', [Validators.required]],
    language: ['', [Validators.required]],
    uploadProtocol: [ProtocolType.ZIP_UPLOAD, [Validators.required]],
    url: ['', [Validators.required]],
    stepSize: [
      '1',
      [
        (control: AbstractControl): ValidationErrors | null => {
          const value = control.value;
          const parsedValue = parseInt(value);
          const isNumeric = `${parsedValue}` === value;

          if (value) {
            if (!isNumeric) {
              return { nonNumeric: true };
            } else if (parsedValue < 1) {
              return { min: true };
            }
          } else {
            return { required: true };
          }
          return null;
        }
      ]
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataset: [(undefined as any) as File, [Validators.required]],
    harvestUrl: ['', [Validators.required]],
    setSpec: [''],
    metadataFormat: [''],
    sendXSLT: [false],
    xsltFile: ['']
  });

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
   * showStepSizeInfo
   * acivate the step-size info modal
   **/
  showStepSizeInfo(): void {
    this.subs.push(this.modalConfirms.open(this.modalIdStepSizeInfo).subscribe());
  }

  /**
   * validateDatasetName
   *
   * form validator implementation for dataset name field
   *
   * @param { FormControl } control - the control to validate
   * @returns null or a code-keyed boolean
   **/
  validateDatasetName(control: FormControl<string>): ValidationErrors | null {
    const val = control.value;
    if (val) {
      const matches = /\w+/.exec(`${val}`);
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
        this.sandbox.submitDataset(form, [this.zipFileFormName, this.xsltFileFormName]).subscribe({
          next: (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
            // treat as SubmissionResponseDataWrapped
            res = (res as unknown) as SubmissionResponseDataWrapped;
            if (res.body) {
              this.notifySubmitted.emit(res.body['dataset-id']);
            } else {
              this.notifySubmitted.emit(((res as unknown) as SubmissionResponseData)['dataset-id']);
            }
          },
          error: (err: HttpErrorResponse): void => {
            this.error = err;
            this.notifyBusy.emit(false);
          }
        })
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
