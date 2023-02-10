import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export function MatchPasswordValidator(ac: AbstractControl): ValidationErrors | null {
  const getField = (fieldName: string): FormControl<string> => {
    return ac.get(fieldName) as FormControl<string>;
  };

  const getValue = (fieldName: string): string => {
    return getField(fieldName).value;
  };

  if (getValue('password') !== getValue('confirm')) {
    const error = { MatchPasswordValidator: 'newnotmatch' };
    getField('confirm').setErrors(error);
    return error;
  } else if (getField('oldpassword') && getValue('oldpassword') === getValue('password')) {
    const error = { MatchPasswordValidator: 'oldsamenew' };
    getField('password').setErrors(error);
    return error;
  } else {
    return null;
  }
}
