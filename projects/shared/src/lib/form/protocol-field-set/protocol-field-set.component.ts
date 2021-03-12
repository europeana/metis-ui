import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { harvestValidator } from './harvest.validator';
import { ProtocolType } from '../../_models';

import { SubscriptionManager } from '../../subscription-manager';

@Component({
  selector: 'lib-protocol-field-set',
  templateUrl: './protocol-field-set.component.html',
  styleUrls: ['./protocol-field-set.component.scss']
})
export class ProtocolFieldSetComponent extends SubscriptionManager {
  @Input() fileFormName: string;
  @Input() protocolSwitchField: string;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();

  ZIP = ProtocolType.ZIP_UPLOAD;
  HTTP = ProtocolType.HTTP_HARVEST;
  OAIPMH = ProtocolType.OAIPMH_HARVEST;

  @Input() disabledProtocols: Array<ProtocolType> = [];
  @Input() visibleProtocols: Array<ProtocolType> = [];

  form: FormGroup;
  @Input() set protocolForm(form: FormGroup) {
    this.form = form;
    this.updateRequired();
  }

  isDisabled(protocol: ProtocolType): boolean {
    return this.disabledProtocols.indexOf(protocol) > -1;
  }

  isVisible(protocol: ProtocolType): boolean {
    return this.visibleProtocols.indexOf(protocol) > -1;
  }

  /** isProtocolHTTP
  /* return true if pluginType is HTTP_HARVEST
  */
  isProtocolHTTP(): boolean {
    return this.form!.value[this.protocolSwitchField] === this.HTTP;
  }

  /** isProtocolOAIPMH
  /* return true if pluginType is OAIPMH_HARVEST
  */
  isProtocolOAIPMH(): boolean {
    return this.form!.value[this.protocolSwitchField] === this.OAIPMH;
  }

  /** isProtocolFile
  /* return true if pluginType is FILE
  */
  isProtocolFile(): boolean {
    return this.form!.value[this.protocolSwitchField] === this.ZIP;
  }

  /** clearFormValidators
  /* remove form validation rules for protocol-related fields
  */
  clearFormValidators(): void {
    ['harvestUrl', 'metadataFormat', 'url', this.fileFormName].forEach((s: string) => {
      const ctrl = this.form.get(s);
      if (ctrl) {
        ctrl.setValidators(null);
        ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    });
  }

  /** setFormValidators
  /* @param {string} ctrlName - the control name
  /* @param {ValidatorFn[]} validatorFns - the control name
  /* assign validatorFns to the FormControl with the given name, if present
  */
  setFormValidators(ctrlName: string, validatorFns: ValidatorFn[]): void {
    const ctrl = this.form.get(ctrlName);
    if (ctrl) {
      ctrl.setValidators(validatorFns);
      ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }

  updateRequired(): void {
    const fn = (): void => {
      this.clearFormValidators();

      const psField = this.form.get(this.protocolSwitchField);
      const psfVal = psField ? psField.value : undefined;

      switch (psfVal) {
        case this.ZIP:
          this.setFormValidators(this.fileFormName, [Validators.required]);
          break;
        case this.OAIPMH:
          this.setFormValidators('harvestUrl', [Validators.required, harvestValidator]);
          this.setFormValidators('metadataFormat', [Validators.required]);
          break;
        case this.HTTP:
          this.setFormValidators('url', [Validators.required, harvestValidator]);
          break;
      }
      this.fieldChanged.emit();
    };
    this.subs.push(this.form.valueChanges.subscribe(fn));
    fn();
  }
}
