import { AbstractControl } from '@angular/forms';

export function MatchPasswordValidator(ac: AbstractControl): undefined | null {
  if (ac.get('password')!.value !== ac.get('confirm')!.value) {
    ac.get('confirm')!.setErrors({ MatchPasswordValidator: 'newnotmatch' });
    return;
  } else if (ac.get('oldpassword') && ac.get('oldpassword')!.value === ac.get('password')!.value) {
    ac.get('password')!.setErrors({ MatchPasswordValidator: 'oldsamenew' });
    return;
  } else {
    return null;
  }
}
