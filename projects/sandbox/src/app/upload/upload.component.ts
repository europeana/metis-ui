import { NgClass, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  resource,
  signal,
  viewChild
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import {
  CheckboxComponent,
  FileUploadComponent,
  ModalConfirmComponent,
  ModalConfirmService,
  ProtocolFieldSetComponent,
  ProtocolType
} from 'shared';
import {
  FieldOption,
  SandboxPageType,
  SubmissionResponseData,
  SubmissionResponseDataWrapped
} from '../_models';
import { getUploadForm, SandboxConfService, UploadService } from '../_services';

@Component({
  selector: 'sb-upload',
  standalone: true,
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
    NgTemplateOutlet
  ]
})
export class UploadComponent implements OnInit, OnDestroy {
  private readonly upload = inject(UploadService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sandboxConf = inject(SandboxConfService);

  public readonly EnumProtocolType = ProtocolType;

  protocolFields = viewChild(ProtocolFieldSetComponent);
  xslFileField = viewChild(FileUploadComponent);

  showing = input(false);
  notifySubmitted = output<string>();

  // Tracks active form lifecycle independent of component destruction
  private readonly formDestroy$ = new Subject<void>();

  countries = resource<FieldOption[], unknown>({
    loader: async () => {
      try {
        return await firstValueFrom(this.upload.getCountries());
      } catch (err) {
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
        if (err?.status === 0 || err?.status === 401) return [];
        throw new Error(err?.message || 'Failed to populate languages list');
      }
    }
  });

  form = signal<FormGroup>(getUploadForm());

  zipFileFormName = 'dataset';
  xsltFileFormName = 'xsltFile';
  modalIdStepSizeInfo = 'id-modal-step-size-info';

  constructor() {
    const error$ = toObservable(computed(() => this.sandboxConf.navConf()[1]?.error));
    error$
      .pipe(
        distinctUntilChanged(),
        filter((error) => !error),
        filter(() => this.showing()),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.rebuildForm();
      });
  }

  ngOnInit(): void {
    this.setupFormTracking(this.form());
  }

  ngOnDestroy(): void {
    this.formDestroy$.next();
    this.formDestroy$.complete();
  }

  /**
   * setupFormTracking
   * Declaratively binds structural tracking subscriptions whenever the underlying
   * formGroup data model is generated or reset.
   *
   * @param { FormGroup } activeForm - the current reactive form instance
   **/
  private setupFormTracking(activeForm: FormGroup): void {
    activeForm.valueChanges
      .pipe(takeUntil(this.formDestroy$), takeUntilDestroyed(this.destroyRef))
      .subscribe((): void => {
        this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { error: undefined });
        this.cdr.markForCheck();
      });

    this.updateConditionalXSLValidator(activeForm);
  }

  rebuildForm(): void {
    this.formDestroy$.next();
    this.form().enable();

    const newForm = getUploadForm();
    this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { error: undefined });

    this.form.set(newForm);
    this.protocolFields()?.clearFileValue();
    this.xslFileField()?.clearFileValue();

    this.setupFormTracking(newForm);

    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
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
      this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, { isBusy: true });
      this.upload
        .submitDataset(currentForm, [this.zipFileFormName, this.xsltFileFormName])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res: SubmissionResponseData | SubmissionResponseDataWrapped) => {
            if (this.destroyRef.destroyed) {
              return;
            }
            const data = 'body' in res && res.body ? res.body : res;
            if ('dataset-id' in data) {
              this.notifySubmitted.emit(data['dataset-id']);
              this.cdr.markForCheck();
            }
          },
          error: (err: HttpErrorResponse): void => {
            if (this.destroyRef.destroyed) return;

            // Re-enable on error so the user can make corrections
            currentForm.enable({ emitEvent: false });

            this.sandboxConf.updateStepStatus(SandboxPageType.UPLOAD, {
              isBusy: false,
              error: err
            });
            this.cdr.markForCheck();
          }
        });
    }
  }

  /**
   * updateConditionalXSLValidator
   * Declaratively handles dynamic XSLT requirements.
   *
   * @param { FormGroup } [activeForm] - optional target form instance
   **/
  public updateConditionalXSLValidator(activeForm?: FormGroup): void {
    const targetForm = activeForm ?? this.form();
    if (!targetForm) {
      return;
    }

    const ctrlFile = targetForm.get(this.xsltFileFormName);
    const ctrlSend = targetForm.get('sendXSLT');

    if (ctrlSend && ctrlFile) {
      ctrlSend.valueChanges
        .pipe(takeUntil(this.formDestroy$), takeUntilDestroyed(this.destroyRef))
        .subscribe((val: boolean): void => {
          // Safeguard against background ghost calls from older instances
          if (this.form() !== targetForm) return;

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
