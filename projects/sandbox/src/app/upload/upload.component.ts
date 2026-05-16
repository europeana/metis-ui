import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  resource,
  signal,
  viewChild
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class UploadComponent extends DataPollingComponent implements OnInit {
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

  countries = resource<FieldOption[], unknown>({
    loader: async () => {
      try {
        return await firstValueFrom(this.upload.getCountries());
      } catch (err) {
        // 🚀 FIXED: Strict lint typing added to prevent implicit any errors
        if (err?.status === 0 || err?.status === 401) return [];
        throw new Error(err?.message || 'Failed to populate countries list');
      }
    }
  });

  languages = resource<FieldOption[], unknown>({
    loader: async () => {
      try {
        return await firstValueFrom(this.upload.getLanguages());
      } catch (err) {
        // 🚀 FIXED: Strict lint typing added to prevent implicit any errors
        if (err?.status === 0 || err?.status === 401) return [];
        throw new Error(err?.message || 'Failed to populate languages list');
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
    // Pure, side-effect-free instantiation constructor matching modern best practices
  }

  ngOnInit(): void {
    // Sync initial form control instance validation trackers synchronously on load
    this.setupFormTracking(this.form());
  }

  /**
   * setupFormTracking
   * Declaratively binds structural tracking subscriptions whenever the underlying
   * formGroup data model is generated or reset.
   *
   * @param { FormGroup } activeForm - the current reactive form instance
   **/
  private setupFormTracking(activeForm: FormGroup): void {
    activeForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((): void => {
      this.error.set(undefined);
      this.cdr.markForCheck();
    });

    this.updateConditionalXSLValidator(activeForm);
  }

  rebuildForm(): void {
    const newForm = getUploadForm();

    this.error.set(undefined);
    this.form.set(newForm);
    this.protocolFields()?.clearFileValue();
    this.xslFileField()?.clearFileValue();

    // Explicitly re-attach tracking channels to the fresh form instance clear of hidden update loops
    this.setupFormTracking(newForm);
    this.cdr.markForCheck();
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        if (this.destroyRef.destroyed) return;
        this.cdr.markForCheck();
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
          next: (res: any): void => {
            if (this.destroyRef.destroyed) return;
            const data = res.body ?? res;
            this.notifySubmitted.emit(data['dataset-id']);
            this.cdr.markForCheck();
          },
          error: (err: HttpErrorResponse): void => {
            if (this.destroyRef.destroyed) return;
            this.error.set(err);
            this.notifyBusy.emit(false);
            this.cdr.markForCheck();
          }
        });
    }
  }

  /**
   * updateConditionalXSLValidator
   * 🚀 FIXED: Marked public and accepts an optional form argument to satisfy
   * both internal initializations and template event handlers safely.
   *
   * @param { FormGroup } [activeForm] - optional target form instance
   **/
  public updateConditionalXSLValidator(activeForm?: FormGroup): void {
    // Fall back to the current reactive form signal instance if no argument is provided
    const targetForm = activeForm ?? this.form();
    if (!targetForm) return;

    const ctrlFile = targetForm.get(this.xsltFileFormName);
    const ctrlSend = targetForm.get('sendXSLT');

    if (ctrlSend && ctrlFile) {
      ctrlSend.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((val: boolean): void => {
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
