import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, input, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  CheckboxComponent,
  DataPollingComponent,
  FileUploadComponent,
  ModalConfirmComponent,
  ModalConfirmService,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';
import { FieldOption, SubmissionResponseData, SubmissionResponseDataWrapped } from '../_models';
import { SandboxService } from '../_services';
import { HttpErrorsComponent } from '../http-errors/errors.component';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sb-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgFor,
    NgIf,
    ProtocolFieldSetComponent,
    ModalConfirmComponent,
    CheckboxComponent,
    FileUploadComponent,
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
  readonly showing = input(false);

  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';

  countryList: Array<FieldOption>;
  languageList: Array<FieldOption>;
  modalIdStepSizeInfo = 'id-modal-step-size-info';

  error: HttpErrorResponse | undefined;
  form: FormGroup;

  constructor() {
    super();
    this.rebuildForm();
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
    this.error = undefined;
    this.form = this.formBuilder.group({
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
    if (this.protocolFields) {
      this.protocolFields.clearFileValue();
    }
    if (this.xslFileField) {
      this.xslFileField.clearFileValue();
    }
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
   * showStepSizeInfo
   * acivate the step-size info modal
   * @param { HTMLElement } openerRef - the element used to open the dialog
   **/
  showStepSizeInfo(openerRef: HTMLElement, openViaKeyboard = false): void {
    this.subs.push(
      this.modalConfirms.open(this.modalIdStepSizeInfo, openViaKeyboard, openerRef).subscribe()
    );
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
