import { AbstractControl } from '@angular/forms';

/** MatchPasswordValidator
/* export function for checking passwords match
*/
export function MatchPasswordValidator(ac: AbstractControl): undefined | null {
  if (ac.get('password')!.value !== ac.get('confirm')!.value) {
    ac.get('confirm')!.setErrors({ MatchPasswordValidator: 'newnotmatch' });
    return undefined;
  } else if (ac.get('oldpassword') && ac.get('oldpassword')!.value === ac.get('password')!.value) {
    ac.get('password')!.setErrors({ MatchPasswordValidator: 'oldsamenew' });
    return undefined;
  } else {
    return null;
  }
}
