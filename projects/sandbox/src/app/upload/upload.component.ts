import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  inject,
  input,
  output,
  resource,
  signal,
  viewChild,
  ChangeDetectorRef,
  DestroyRef
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  public readonly EnumProtocolType = ProtocolType;

  protocolFields = viewChild(ProtocolFieldSetComponent);
  xslFileField = viewChild(FileUploadComponent);

  showing = input(false);
  notifyBusy = output<boolean>();
  notifySubmitted = output<string>();

  // 1. Safe countries loader that handles pre-authentication failures cleanly
  countries = resource<FieldOption[], unknown>({
    loader: async () => {
      try {
        return await firstValueFrom(this.upload.getCountries());
      } catch (err) {
        // If status is 0 (network cut/redirect) or 401 (unauthorized), return an empty fallback array
        if (err?.status === 0 || err?.status === 401) {
          return [];
        }
        // Rethrow normal application runtime errors
        throw new Error(err?.message || 'Failed to populate countries configuration list');
      }
    }
  });

  // 2. Safe languages loader
  languages = resource<FieldOption[], unknown>({
    loader: async () => {
      try {
        return await firstValueFrom(this.upload.getLanguages());
      } catch (err) {
        if (err?.status === 0 || err?.status === 401) {
          return [];
        }
        throw new Error(err?.message || 'Failed to populate languages configuration list');
      }
    }
  });

  error = signal<HttpErrorResponse | undefined>(undefined);
  form = signal<FormGroup>(getUploadForm());

  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';
  modalIdStepSizeInfo = 'id-modal-step-size-info';

  constructor() {
    super();

    // 2. Map form value changes using native tracking to prevent leak loops
    this.form()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.error.set(undefined));

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
    this.modalConfirms
      .open(this.modalIdStepSizeInfo, openViaKeyboard, openerRef)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdr.markForCheck(); // 👈 Explicitly forces view refresh in Zoneless on async modal resolution
      });
  }

  onSubmitDataset(): void {
    const currentForm = this.form();
    if (currentForm.valid) {
      currentForm.disable();
      this.notifyBusy.emit(true);

      this.upload
        .submitDataset(currentForm, [this.zipFileFormName, this.xsltFileFormName])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: any) => {
            const data = res.body ?? res;
            this.notifySubmitted.emit(data['dataset-id']);
            this.cdr.markForCheck();
          },
          error: (err: HttpErrorResponse) => {
            this.error.set(err);
            this.notifyBusy.emit(false);
            this.cdr.markForCheck(); // 👈 Guarantees the error template renders instantly without zone triggers
          }
        });
    }
  }

  updateConditionalXSLValidator(): void {
    const f = this.form();
    const ctrlFile = f.get(this.xsltFileFormName);
    const ctrlSend = f.get('sendXSLT');

    if (ctrlSend && ctrlFile) {
      ctrlSend.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
        if (val) {
          ctrlFile.setValidators([Validators.required]);
        } else {
          ctrlFile.clearValidators();
        }
        ctrlFile.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
    }
  }
}
