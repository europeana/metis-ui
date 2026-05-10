import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, resource, signal, viewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  CheckboxComponent,
  DataPollingComponent,
  FileUploadComponent,
  ModalConfirmComponent,
  ModalConfirmService,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';
import { FieldOption } from '../_models';
import { getUploadForm, UploadService } from '../_services';
import { HttpErrorsComponent } from '../http-errors/errors.component';

@Component({
  selector: 'sb-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ProtocolFieldSetComponent,
    ModalConfirmComponent,
    CheckboxComponent,
    FileUploadComponent,
    NgTemplateOutlet,
    HttpErrorsComponent
  ]
})
export class UploadComponent extends DataPollingComponent {
  private readonly upload = inject(UploadService);
  private readonly modalConfirms = inject(ModalConfirmService);

  public readonly EnumProtocolType = ProtocolType;

  protocolFields = viewChild(ProtocolFieldSetComponent);
  xslFileField = viewChild(FileUploadComponent);

  showing = input(false);
  notifyBusy = output<boolean>();
  notifySubmitted = output<string>();

  countries = resource<FieldOption[], unknown>({
    loader: () => firstValueFrom(this.upload.getCountries())
  });

  languages = resource<FieldOption[], unknown>({
    loader: () => firstValueFrom(this.upload.getLanguages())
  });

  error = signal<HttpErrorResponse | undefined>(undefined);
  form = signal<FormGroup>(getUploadForm());

  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';
  modalIdStepSizeInfo = 'id-modal-step-size-info';

  constructor() {
    super();
    this.form().valueChanges.subscribe(() => this.error.set(undefined));
    this.updateConditionalXSLValidator();
  }

  rebuildForm(): void {
    this.error.set(undefined);
    this.form.set(getUploadForm());
    this.protocolFields()?.clearFileValue();
    this.xslFileField()?.clearFileValue();
  }

  protocolIsValid(): boolean {
    const f = this.form();
    const fields = [
      'uploadProtocol',
      'url',
      'dataset',
      'harvestUrl',
      'setSpec',
      'metadataFormat',
      'xsltFile'
    ];
    return fields.every((name) => f.get(name)?.valid);
  }

  showStepSizeInfo(openerRef: HTMLElement, openViaKeyboard = false): void {
    this.subs.push(
      this.modalConfirms.open(this.modalIdStepSizeInfo, openViaKeyboard, openerRef).subscribe()
    );
  }

  onSubmitDataset(): void {
    const currentForm = this.form();
    if (currentForm.valid) {
      currentForm.disable();
      this.notifyBusy.emit(true);

      this.subs.push(
        this.upload
          .submitDataset(currentForm, [this.zipFileFormName, this.xsltFileFormName])
          .subscribe({
            next: (res: any) => {
              const data = res.body ?? res;
              this.notifySubmitted.emit(data['dataset-id']);
            },
            error: (err: HttpErrorResponse) => {
              this.error.set(err);
              this.notifyBusy.emit(false);
            }
          })
      );
    }
  }

  // Renamed to match template and made public
  updateConditionalXSLValidator(): void {
    const f = this.form();
    const ctrlFile = f.get(this.xsltFileFormName);
    const ctrlSend = f.get('sendXSLT');

    if (ctrlSend && ctrlFile) {
      this.subs.push(
        ctrlSend.valueChanges.subscribe((val) => {
          if (val) {
            ctrlFile.setValidators([Validators.required]);
          } else {
            ctrlFile.clearValidators();
          }
          ctrlFile.updateValueAndValidity({ emitEvent: false });
        })
      );
    }
  }
}
