import '@angular/localize/init';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component, inject, input, OnInit, viewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ClassMap, ProtocolType } from '../../_models/shared-models';
import { SubscriptionManager } from '../../subscription-manager/subscription.manager';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { RadioButtonComponent } from '../radio-button/radio-button.component';
import { harvestValidator } from './harvest.validator';

@Component({
  selector: 'lib-protocol-field-set',
  templateUrl: './protocol-field-set.component.html',
  styleUrls: ['./protocol-field-set.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    NgStyle,
    RadioButtonComponent,
    CheckboxComponent,
    FileUploadComponent
  ]
})
export class ProtocolFieldSetComponent extends SubscriptionManager implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);

  // --- SIGNAL INPUTS ---
  fileFormName = input.required<string>();
  protocolSwitchField = input.required<string>();
  incrementalAvailable = input<boolean>(true);
  incrementalDisabled = input<boolean>(false);
  labelRequiredFieldClassMap = input<ClassMap>({ asterisked: true });
  acceptedFileTypes = input<string>('.zip');
  disabledProtocols = input<Array<ProtocolType>>([]);
  visibleProtocols = input<Array<ProtocolType>>([]);
  protocolForm = input.required<FormGroup>();

  // --- CHILD VIEW REFERENCES ---
  //@ViewChild('fileUpload', { static: false }) fileUpload!: FileUploadComponent;
  readonly fileUpload = viewChild(FileUploadComponent);

  // --- PROTOCOL TYPE ENUMS ---
  readonly ZIP = ProtocolType.ZIP_UPLOAD;
  readonly HTTP = ProtocolType.HTTP_HARVEST;
  readonly OAIPMH = ProtocolType.OAIPMH_HARVEST;

  // 🚀 FIX: Switched from a computed signal back to a raw FormGroup property getter.
  // This satisfies the strict type expectations inside 'lib-checkbox' and 'lib-radio-button'.
  get form(): FormGroup {
    return this.protocolForm();
  }

  // 🚀 FIX: Moved the side-effect validation loop to ngOnInit to prevent the
  // catastrophic memory leak where subscriptions multiplied on every change detection run.
  ngOnInit(): void {
    const activeForm = this.form;

    const syncValidationRules = (): void => {
      this.clearFormValidators(activeForm);

      const psField = activeForm.get(this.protocolSwitchField());
      const psfVal = psField ? psField.value : undefined;

      switch (psfVal) {
        case this.ZIP:
          this.setFormValidators(activeForm, this.fileFormName(), [Validators.required]);
          break;
        case this.OAIPMH:
          this.setFormValidators(activeForm, 'harvestUrl', [Validators.required, harvestValidator]);
          this.setFormValidators(activeForm, 'metadataFormat', [Validators.required]);
          break;
        case this.HTTP:
          this.setFormValidators(activeForm, 'url', [Validators.required, harvestValidator]);
          break;
      }
      this.cdr.markForCheck();
    };

    // Safely track a single stream subscription that cleans up via SubscriptionManager
    const sub = activeForm.valueChanges.subscribe(syncValidationRules);
    this.subs.push(sub);

    // Run initially to map constraints on startup
    syncValidationRules();
  }

  // --- TEMPLATE UTILITIES ---
  isProtocolDisabled(protocol: ProtocolType): boolean {
    return this.form.disabled || this.disabledProtocols().includes(protocol);
  }

  isProtocolVisible(protocol: ProtocolType): boolean {
    return this.visibleProtocols().includes(protocol);
  }

  isProtocolHTTP(): boolean {
    return this.form.value[this.protocolSwitchField()] === this.HTTP;
  }

  isProtocolOAIPMH(): boolean {
    return this.form.value[this.protocolSwitchField()] === this.OAIPMH;
  }

  isProtocolFile(): boolean {
    return this.form.value[this.protocolSwitchField()] === this.ZIP;
  }

  clearFileValue(): void {
    this.fileUpload()?.clearFileValue();
  }

  // --- VALIDATOR ENGINE HELPERS ---
  clearFormValidators(form: FormGroup): void {
    ['harvestUrl', 'metadataFormat', 'url', this.fileFormName() ?? ''].forEach((s: string) => {
      const ctrl = form.get(s);
      if (ctrl) {
        ctrl.setValidators(null);
        ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    });
  }

  setFormValidators(form: FormGroup, ctrlName: string, validatorFns: ValidatorFn[]): void {
    const ctrl = form.get(ctrlName);
    if (ctrl) {
      ctrl.setValidators(validatorFns);
      ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }
}
