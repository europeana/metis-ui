import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, input, OnInit, Output, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { take } from 'rxjs/operators';

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
import { getUploadForm, UploadService } from '../_services';
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
export class UploadComponent extends DataPollingComponent implements OnInit {
  private readonly upload = inject(UploadService);
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
  }

  ngOnInit(): void {
    this.subs.push(
      this.upload.getCountries().subscribe((countries: Array<FieldOption>) => {
        this.countryList = countries;
      })
    );
    this.subs.push(
      this.upload.getLanguages().subscribe((languages: Array<FieldOption>) => {
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
    this.form = getUploadForm();
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
      this.modalConfirms
        .open(this.modalIdStepSizeInfo, openViaKeyboard, openerRef)
        .pipe(take(1))
        .subscribe()
    );
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
        this.upload.submitDataset(form, [this.zipFileFormName, this.xsltFileFormName]).subscribe({
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
