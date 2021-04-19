import { AbstractControl, FormControl } from '@angular/forms';

/** MatchPasswordValidator
/* export function for checking passwords match
*/
export function MatchPasswordValidator(ac: AbstractControl): undefined | null {
  const getField = (fieldName: string): FormControl => {
    return ac.get(fieldName) as FormControl;
  };

  const getValue = (fieldName: string): string => {
    return getField(fieldName).value as string;
  };

  if (getValue('password') !== getValue('confirm')) {
    getField('confirm').setErrors({ MatchPasswordValidator: 'newnotmatch' });
    return undefined;
  } else if (getField('oldpassword') && getValue('oldpassword') === getValue('password')) {
    getField('password').setErrors({ MatchPasswordValidator: 'oldsamenew' });
    return undefined;
  } else {
    return null;
  }
}
