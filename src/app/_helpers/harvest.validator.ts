import { AbstractControl } from '@angular/forms';

export function harvestValidator(control: AbstractControl) {
  if (control.value.indexOf('?') >= 0) {
    return {'validParameter': true };
  }

  var regex = /(http(s?))\:\/\//g;
  if (!regex.test(control.value)) {
    return {'validUrl': true };
  }
  return null;
}
