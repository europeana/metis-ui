import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { harvestValidator } from '../../_helpers';
import { ProtocolType } from '../../_models';

import { SubscriptionManager } from '../../subscription-manager';

@Component({
  selector: 'lib-protocol-field-set',
  templateUrl: './protocol-field-set.component.html',
  styleUrls: ['./protocol-field-set.component.scss']
})
export class ProtocolFieldSetComponent extends SubscriptionManager {
  @Input() fileFormName: string;
  @Input() hasFileOption = false;
  @Input() protocolSwitchField: string;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();

  form: FormGroup;
  @Input() set protocolForm(form: FormGroup) {
    this.form = form;
    this.updateRequired();

    this.subs.push(
      this.form.valueChanges.subscribe(() => {
        this.updateRequired();
        this.fieldChanged.emit();
      })
    );
  }
  subValueChanges: Subscription;

  /** isProtocolHTTP
  /* return true if pluginType is HTTP_HARVEST
  */
  isProtocolHTTP(): boolean {
    return this.form!.value[this.protocolSwitchField] === ProtocolType.HTTP_HARVEST;
  }

  /** isProtocolOAIPMH
  /* return true if pluginType is OAIPMH_HARVEST
  */
  isProtocolOAIPMH(): boolean {
    return this.form!.value[this.protocolSwitchField] === ProtocolType.OAIPMH_HARVEST;
  }

  /** isProtocolFile
  /* return true if pluginType is FILE
  */
  isProtocolFile(): boolean {
    return this.form!.value[this.protocolSwitchField] === ProtocolType.FILE;
  }

  clearValidators(): void {
    ['harvestUrl', 'metadataFormat', 'url', this.fileFormName].forEach((s: string) => {
      const ctrl = this.form.get(s);
      if (ctrl) {
        ctrl.setValidators(null);
        ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      }
    });
  }

  setFormValidators(ctrlName: string, newValidators: ValidatorFn[]): void {
    const ctrl = this.form.get(ctrlName);
    if (ctrl) {
      ctrl.setValidators(newValidators);
      ctrl.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    }
  }

  updateRequired(): void {
    this.subValueChanges = this.form.valueChanges.subscribe(() => {
      this.clearValidators();
      if (this.form.get(this.protocolSwitchField)!.value === 'FILE') {
        this.setFormValidators(this.fileFormName, [Validators.required]);
      } else if (this.form.get(this.protocolSwitchField)!.value === 'OAIPMH_HARVEST') {
        this.setFormValidators('harvestUrl', [Validators.required, harvestValidator]);
        this.setFormValidators('metadataFormat', [Validators.required]);
      } else if (this.form.get(this.protocolSwitchField)!.value === 'HTTP_HARVEST') {
        this.setFormValidators('url', [Validators.required, harvestValidator]);
      }
    });
  }
}
