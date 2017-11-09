import { AbstractControl } from '@angular/forms';

export function MatchPassword(ac: AbstractControl) {
  if (ac.get('password').value !== ac.get('confirm').value) {
    ac.get('confirm').setErrors( {MatchPassword: true} );
  } else {
    return null;
  }
}
