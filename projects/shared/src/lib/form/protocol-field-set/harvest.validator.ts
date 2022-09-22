import { AbstractControl, ValidationErrors } from '@angular/forms';

/** harvestValidator
/* checks the validity of the control value
*/
export function harvestValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return { validUrl: true };
  }
  if (value.indexOf('?') >= 0) {
    return { validParameter: true };
  }
  const regex = /(http(s?)|ftp):\/\//g;
  if (!regex.test(value)) {
    return { validUrl: true };
  }
  return null;
}
