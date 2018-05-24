import { AbstractControl } from '@angular/forms';

export function harvestValidator(control: AbstractControl) {
  if (control.value.indexOf(' ') >= 0) {
    return {'validWhitespace': true };
  }
  if (control.value.indexOf('?') >= 0) {
    return {'validParameter': true };
  }
  if (control.value.indexOf('http') >= 0) {
    return {'validParameter': true };
  }
  return null;
}
