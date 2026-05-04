import '@angular/localize/init';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, computed, input, ViewChild } from '@angular/core';
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
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    RadioButtonComponent,
    CheckboxComponent,
    NgStyle,
    FileUploadComponent
  ]
})
export class ProtocolFieldSetComponent extends SubscriptionManager {
  fileFormName = input.required<string>();
  protocolSwitchField = input.required<string>();
  incrementalAvailable = input<boolean>(true);
  incrementalDisabled = input<boolean>(false);
  labelRequiredFieldClassMap = input<ClassMap>({ asterisked: true });
  acceptedFileTypes = input<string>('.zip');

  @ViewChild('fileUpload', { static: false }) fileUpload: FileUploadComponent;

  ZIP = ProtocolType.ZIP_UPLOAD;
  HTTP = ProtocolType.HTTP_HARVEST;
  OAIPMH = ProtocolType.OAIPMH_HARVEST;

  disabledProtocols = input<Array<ProtocolType>>([]);
  visibleProtocols = input<Array<ProtocolType>>([]);

  protocolForm = input.required<FormGroup>();

  form = computed(() => {
    return this.updateRequired(this.protocolForm());
  });

  /** isProtocolDisabled
  /* Template utility
  /* @param { ProtocolType } - protocol
  /* @returns true if form is disabled or the protocol is in disabledProtocols array
  */
  isProtocolDisabled(protocol: ProtocolType): boolean {
    return this.form().disabled || this.disabledProtocols().includes(protocol);
  }

  /** isProtocolVisible
   * Template utility
   * @param { ProtocolType } - protocol
   * @returns true if protocol is in visibleProtocols array
   **/
  isProtocolVisible(protocol: ProtocolType): boolean {
    return this.visibleProtocols().includes(protocol);
  }

  /** isProtocolHTTP
   * return true if pluginType is HTTP_HARVEST
   **/
  isProtocolHTTP(): boolean {
    return this.form().value[this.protocolSwitchField()] === this.HTTP;
  }

  /** isProtocolOAIPMH
   * return true if pluginType is OAIPMH_HARVEST
   **/
  isProtocolOAIPMH(): boolean {
    return this.form().value[this.protocolSwitchField()] === this.OAIPMH;
  }

  /** isProtocolFile
   * return true if pluginType is FILE
   **/
  isProtocolFile(): boolean {
    return this.form().value[this.protocolSwitchField()] === this.ZIP;
  }

  /** clearFormValidators
   * remove form validation rules for protocol-related fields
   /* @param { FormGroup } - form
  **/
  clearFormValidators(form: FormGroup): void {
    ['harvestUrl', 'metadataFormat', 'url', this.fileFormName() ?? ''].forEach((s: string) => {
      const ctrl = form.get(s);
      if (ctrl) {
        ctrl.setValidators(null);
        ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    });
  }

  /** clearFileValue
  /* calls clearFileValue on the fileUpload component
  */
  clearFileValue(): void {
    this.fileUpload.clearFileValue();
  }

  /** setFormValidators
   * @param {FormGroup} form
   * @param {string} ctrlName - the control name
   * @param {ValidatorFn[]} validatorFns - the control name
   * assign validaftorFns to the FormControl with the given name, if present
   **/
  setFormValidators(form: FormGroup, ctrlName: string, validatorFns: ValidatorFn[]): void {
    const ctrl = form.get(ctrlName);
    if (ctrl) {
      ctrl.setValidators(validatorFns);
      ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }

  updateRequired(form: FormGroup): FormGroup {
    const fn = (): void => {
      this.clearFormValidators(form);

      const psField = form.get(this.protocolSwitchField());
      const psfVal = psField ? psField.value : undefined;

      switch (psfVal) {
        case this.ZIP:
          this.setFormValidators(form, this.fileFormName(), [Validators.required]);
          break;
        case this.OAIPMH:
          this.setFormValidators(form, 'harvestUrl', [Validators.required, harvestValidator]);
          this.setFormValidators(form, 'metadataFormat', [Validators.required]);
          break;
        case this.HTTP:
          this.setFormValidators(form, 'url', [Validators.required, harvestValidator]);
          break;
      }
    };
    this.subs.push(form.valueChanges.subscribe(fn));
    fn();
    return form;
  }
}
